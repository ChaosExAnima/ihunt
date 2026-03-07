import { TRPCError } from '@trpc/server';
import * as z from 'zod';

import { HuntStatus } from '@/lib/constants';
import { idSchemaCoerce } from '@/lib/schemas';

import { db } from '../lib/db';
import {
	assertHuntsEnabled,
	huntDisplayInclude,
	isHuntsDisabled,
} from '../lib/hunt';
import { huntInLockdown } from '../lib/hunt';
import {
	fetchDailyHuntCount,
	fetchUnclaimedSpots,
	reservationsFromHunts,
	respondToInvites,
} from '../lib/invite';
import { notifyHuntsReload } from '../lib/notify';
import { uploadPhoto } from '../lib/photo';
import { InviteStatus, outputHuntSchema } from '../lib/schema';
import { router, userProcedure } from '../lib/trpc';

export const huntRouter = router({
	getActive: userProcedure.output(outputHuntSchema.array()).query(
		({
			ctx: {
				hunter: { id },
			},
		}) => {
			if (isHuntsDisabled()) {
				return [];
			}
			return db.hunt.findMany({
				include: huntDisplayInclude,
				where: {
					hunters: {
						some: {
							id,
						},
					},
					status: HuntStatus.Active,
				},
			});
		},
	),

	getAvailable: userProcedure
		.output(outputHuntSchema.array())
		.query(async ({ ctx: { hunter: currentHunter } }) => {
			if (isHuntsDisabled()) {
				return [];
			}

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
		}),

	getCompleted: userProcedure
		.output(outputHuntSchema.array())
		.query(({ ctx: { hunter } }) =>
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

	getHuntsToday: userProcedure.query(async ({ ctx: { hunter } }) => {
		if (isHuntsDisabled()) {
			return 0;
		}
		return fetchDailyHuntCount(hunter.id);
	}),

	getOne: userProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
			}),
		)
		.output(outputHuntSchema.nullable())
		.query(({ input: { huntId: id } }) =>
			db.hunt.findUnique({
				include: huntDisplayInclude,
				where: { id },
			}),
		),

	getPublic: userProcedure.output(outputHuntSchema.array()).query(() => {
		if (isHuntsDisabled()) {
			return [];
		}

		return db.hunt.findMany({
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
		});
	}),

	join: userProcedure.input(z.object({ huntId: idSchemaCoerce })).mutation(
		async ({
			ctx: {
				hunter: currentHunter,
				req: { log },
			},
			input,
		}) => {
			assertHuntsEnabled();

			const { huntId } = input;
			const { hunt, invited, invitedCount, joined, joinedCount } =
				await fetchUnclaimedSpots(huntId);

			// If we already joined, leave the hunt.
			if (joined.has(currentHunter.id)) {
				if (huntInLockdown(hunt)) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Cannot leave before hunt',
					});
				}
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
				log.info(
					`${currentHunter.name} canceled hunt with ID ${huntId}`,
				);
				notifyHuntsReload();
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
			log.info(`${currentHunter.name} accepted hunt with ID ${huntId}`);

			notifyHuntsReload();

			await respondToInvites({
				currentHunter,
				hunt,
				huntId,
				response: 'accept',
			});

			return { accepted: true, huntId };
		},
	),

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
			assertHuntsEnabled();

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
