import { TRPCError } from '@trpc/server';
import * as z from 'zod';

import { huntDisplayInclude, HuntStatus } from '@/lib/constants';
import { idSchemaCoerce } from '@/lib/schemas';
import { db } from '@/server/lib/db';
import {
	fetchDailyHuntCount,
	fetchUnclaimedSpots,
	reservationsFromHunts,
	respondToInvites,
} from '@/server/lib/invite';
import { uploadPhoto } from '@/server/lib/photo';
import { InviteStatus, outputHuntSchema } from '@/server/lib/schema';
import { adminProcedure, router, userProcedure } from '@/server/lib/trpc';

import { handleError, wrapRoute } from '../lib/error';

export const huntRouter = router({
	getActive: userProcedure.output(outputHuntSchema.array()).query(
		({
			ctx: {
				hunter: { id },
			},
		}) =>
			wrapRoute(
				db.hunt.findMany({
					include: huntDisplayInclude,
					where: {
						hunters: {
							some: {
								id,
							},
						},
						status: HuntStatus.Active,
					},
				}),
			),
	),

	getAvailable: userProcedure
		.output(outputHuntSchema.array())
		.query(async ({ ctx: { hunter: currentHunter } }) => {
			try {
				const result = await db.hunt.findMany({
					include: {
						...huntDisplayInclude,
						invites: true,
					},
					orderBy: {
						createdAt: 'desc',
					},
					where: {
						status: HuntStatus.Available,
					},
				});

				const invitedHuntMap = await reservationsFromHunts(
					result,
					currentHunter.id,
				);

				return result.map(({ invites: _, ...hunt }) => ({
					...hunt,
					reserved: invitedHuntMap.get(hunt.id) ?? null,
				}));
			} catch (err) {
				handleError({ err });
				return [];
			}
		}),

	getCompleted: userProcedure
		.output(outputHuntSchema.array())
		.query(({ ctx: { hunter } }) =>
			wrapRoute(
				db.hunt.findMany({
					include: huntDisplayInclude,
					orderBy: {
						completedAt: 'desc',
					},
					where: {
						hunters: {
							some: {
								id: hunter.id,
							},
						},
						status: HuntStatus.Complete,
					},
				}),
			),
		),

	getHuntsToday: userProcedure.query(async ({ ctx: { hunter } }) =>
		wrapRoute(fetchDailyHuntCount(hunter.id)),
	),

	getOne: userProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
			}),
		)
		.output(outputHuntSchema.nullable())
		.query(({ input: { huntId: id } }) =>
			wrapRoute(
				db.hunt.findUnique({
					include: huntDisplayInclude,
					where: { id },
				}),
			),
		),

	getPublic: userProcedure.output(outputHuntSchema.array()).query(() =>
		wrapRoute(
			db.hunt.findMany({
				include: huntDisplayInclude,
				orderBy: [
					{
						status: 'asc',
					},
					{
						createdAt: 'desc',
					},
				],
				where: {
					status: HuntStatus.Available,
				},
			}),
		),
	),

	join: userProcedure
		.input(z.object({ huntId: idSchemaCoerce }))
		.mutation(async ({ ctx: { hunter: currentHunter }, input }) => {
			const { huntId } = input;
			try {
				const { hunt, invited, invitedCount, joined, joinedCount } =
					await fetchUnclaimedSpots(huntId);

				// If we already joined, leave the hunt.
				if (joined.has(currentHunter.id)) {
					await db.hunt.update({
						data: {
							hunters: {
								disconnect: {
									id: currentHunter.id,
								},
							},
						},
						where: { id: huntId },
					});
					await db.huntInvite.updateMany({
						data: { status: InviteStatus.Expired },
						where: {
							fromHunterId: currentHunter.id,
							huntId,
						},
					});
					console.log(
						`${currentHunter.name} canceled hunt with ID ${huntId}`,
					);
					return { accepted: false, huntId };
				}

				if (
					joinedCount >= hunt.maxHunters ||
					(joinedCount + invitedCount >= hunt.maxHunters &&
						!invited.has(currentHunter.id))
				) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Hunt is already full',
					});
				}

				// Join the hunt.
				await db.hunt.update({
					data: {
						hunters: {
							connect: {
								id: currentHunter.id,
							},
						},
					},
					where: { id: huntId },
				});
				console.log(
					`${currentHunter.name} accepted hunt with ID ${huntId}`,
				);

				await respondToInvites({
					currentHunter,
					hunt,
					huntId,
					response: 'accept',
				});

				return { accepted: true, huntId };
			} catch (err: unknown) {
				handleError({ err, throws: false });
				return { accepted: false, huntId: null };
			}
		}),

	remove: adminProcedure
		.input(z.object({ hunterId: idSchemaCoerce, huntId: idSchemaCoerce }))
		.mutation(async ({ input }) => {
			await db.hunt.update({
				data: {
					hunters: {
						disconnect: {
							id: input.hunterId,
						},
					},
				},
				where: { id: input.huntId },
			});
			return { success: true };
		}),

	uploadPhoto: userProcedure
		.input(
			z.instanceof(FormData).transform((fd) =>
				z
					.object({
						huntId: idSchemaCoerce.optional(),
						name: z.string().min(1).optional(),
						photo: z.instanceof(File),
					})
					.parse(Object.fromEntries(fd.entries())),
			),
		)
		.mutation(async ({ ctx: { hunter }, input }) => {
			const { huntId, name, photo } = input;
			const bytes = await photo.bytes();
			const result = await uploadPhoto({
				buffer: bytes,
				hunterId: hunter.id,
				huntId,
				name,
			});

			return { id: result.id };
		}),
});
