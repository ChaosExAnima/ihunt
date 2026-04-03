import * as z from 'zod';

import {
	idArray,
	idSchema,
	notifyEventSchema,
	notifyTypeSchema,
} from '@/lib/schemas';

import { config } from '../lib/config';
import { db, Prisma } from '../lib/db';
import { handleError } from '../lib/error';
import { ee, notifyUser, saveSubscription } from '../lib/notify';
import { subscriptionSchema } from '../lib/schema';
import { adminProcedure, router, userProcedure } from '../lib/trpc';

export const notifyRouter = router({
	list: userProcedure
		.output(
			notifyEventSchema
				.extend({
					id: idSchema,
					seen: z.boolean(),
					created: z.date(),
					huntId: idSchema.optional(),
				})
				.array(),
		)
		.query(async ({ ctx: { hunter, isLan } }) => {
			const notifications = await db.notification.findMany({
				where: {
					hunter,
				},
				orderBy: {
					createdAt: 'desc',
				},
			});

			const schema = notifyEventSchema
				.omit({ type: true, url: true })
				.extend({ url: z.string().optional() });

			const host =
				isLan && config.lanHost ? config.lanHost : config.publicHost;

			return notifications.map(
				({ id, createdAt, type, event: rawEvent, seenAt }) => {
					const event = schema.parse(rawEvent);
					return {
						id,
						seen: seenAt !== null,
						created: createdAt,
						type: notifyTypeSchema.parse(type),
						...event,
						url: event.url?.startsWith('/')
							? `${host}${event.url}`
							: event.url,
					};
				},
			);
		}),

	unreadCount: userProcedure.query(async ({ ctx: { hunter } }) => {
		const count = await db.notification.count({
			where: {
				hunter,
				seenAt: null,
			},
		});
		return count;
	}),

	read: userProcedure
		.input(
			z
				.object({
					ids: idArray.optional(),
					before: z.date().optional(),
				})
				.default({}),
		)
		.mutation(async ({ ctx: { hunter }, input: { ids, before } }) => {
			const where: Prisma.NotificationWhereInput = {
				hunter,
				seenAt: null,
			};
			if (ids?.length) {
				where.id = {
					in: ids,
				};
			} else if (before) {
				where.createdAt = {
					lt: before,
				};
			}

			const { count } = await db.notification.updateMany({
				data: {
					seenAt: new Date(),
				},
				where,
			});

			return count;
		}),

	message: adminProcedure
		.input(
			z.object({
				body: z.string().optional(),
				force: z.boolean().optional(),
				ids: idArray,
				title: z.string(),
				type: notifyTypeSchema.optional(),
			}),
		)
		.mutation(
			async ({
				input: { body, force, ids, title, type = 'message' },
				ctx: {
					req: { log },
				},
			}) => {
				let sent = 0;
				for (const userId of ids) {
					try {
						const hunter = await db.hunter.findUnique({
							where: { userId },
						});
						if (hunter) {
							await db.notification.create({
								data: {
									hunterId: hunter.id,
									type,
									event: { body, title, type },
								},
							});
						}
						const result = await notifyUser({
							event: { body, title, type },
							force,
							userId,
						});
						if (result) {
							sent++;
						}
					} catch (err) {
						handleError({ err, throws: false, logger: log });
					}
				}
				return {
					sent,
				};
			},
		),

	onNotify: userProcedure.subscription(async function* ({
		ctx: {
			req: { log },
			user,
		},
		signal,
	}) {
		if (!user.id) {
			return;
		}
		const iterable = ee.toIterable('notify', { signal });

		log.info(`user ${user.id} subscribed to notify events`);

		// yield any new posts from the event emitter
		try {
			for await (const [userId, payload] of iterable) {
				log.info(payload, `got event for user ${userId}`);

				// Notify everyone except the original hunter on a join event.
				if (payload.type === 'hunt-update' && userId !== user.id) {
					yield payload;
				} else if (userId === null || user.id === userId) {
					// Otherwise, send the payload over.
					yield payload;
				}
			}
		} finally {
			log.info(`user ${user.id} unsubbed to events`);
		}
	}),

	subscribe: userProcedure
		.input(subscriptionSchema)
		.mutation(async ({ ctx: { user }, input }) => {
			if (!user.id) {
				return { success: false };
			}
			const subscription = await saveSubscription({
				subscription: input,
				userId: user.id,
			});
			return {
				success: !!subscription,
			};
		}),
});
