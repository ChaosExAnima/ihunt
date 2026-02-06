import * as z from 'zod';

import { idArray, notifyTypeSchema } from '@/lib/schemas';

import { handleError } from '../lib/error';
import { ee, notifyUser, saveSubscription } from '../lib/notify';
import { subscriptionSchema } from '../lib/schema';
import { adminProcedure, router, userProcedure } from '../lib/trpc';

export const notifyRouter = router({
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
		.mutation(async ({ input: { body, force, ids, title, type } }) => {
			let sent = 0;
			for (const userId of ids) {
				try {
					const result = await notifyUser({
						event: { body, title, type: type ?? 'message' },
						force,
						userId,
					});
					if (result) {
						sent++;
					}
				} catch (err) {
					handleError({ err, throws: false });
				}
			}
			return {
				sent,
			};
		}),

	onNotify: userProcedure.subscription(async function* ({
		ctx: {
			req: { log },
			user,
		},
		signal,
	}) {
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
			const subscription = await saveSubscription({
				subscription: input,
				userId: user.id,
			});
			return {
				success: !!subscription,
			};
		}),
});
