import { HuntStatus, SpotStatus } from '@ihunt/lib/constants';
import { huntStatus, idSchemaCoerce, posIntSchema } from '@ihunt/lib/schemas';
import { extractIds } from '@ihunt/lib/utils';
import { TRPCError } from '@trpc/server';
import * as z from 'zod';

import { db } from '../lib/db';
import {
	assertHuntsEnabled,
	huntDisplayInclude,
	isHuntsDisabled,
} from '../lib/hunt';
import { huntInLockdown } from '../lib/hunt';
import { huntersFromGroupId } from '../lib/hunter';
import {
	inviteResponseEvent,
	notifyHunter,
	notifyHuntsReload,
} from '../lib/notify';
import { photosFromHunter, uploadPhoto } from '../lib/photo';
import { outputHuntSchema } from '../lib/schema';
import {
	claimHuntSpot,
	clearHuntSpot,
	dailyHuntCount,
	hunterIdsByHunt,
	spotByHunter,
	hunterIdsToInvite,
} from '../lib/spot';
import { router, userProcedure } from '../lib/trpc';

export const huntRouter = router({
	getHuntsBy: userProcedure
		.input(z.object({ status: huntStatus }))
		.output(outputHuntSchema.array())
		.query(
			async ({
				input: { status },
				ctx: {
					hunter: { id: hunterId },
					user: { code },
					admin,
				},
			}) => {
				if (!admin && (status === 'cancelled' || status === 'pending')) {
					throw new TRPCError({ code: 'FORBIDDEN' });
				}

				if (isHuntsDisabled(code, admin) && status !== 'complete') {
					return [];
				}

				const hunts = await db.hunt.findMany({
					where: {
						status,
						spots: status !== 'available' ? { some: { hunterId } } : undefined,
					},
					include: huntDisplayInclude,
					orderBy: { scheduledAt: 'desc' },
				});

				return hunts.map(({ photos, ...hunt }) => ({
					...hunt,
					photos: photosFromHunter(photos, hunterId),
				}));
			},
		),

	getHuntsToday: userProcedure.output(posIntSchema).query(
		async ({
			ctx: {
				hunter,
				user: { code },
				admin,
			},
		}) => {
			if (isHuntsDisabled(code, admin)) {
				return 0;
			}
			return await dailyHuntCount(hunter.id);
		},
	),

	getOne: userProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
			}),
		)
		.output(outputHuntSchema)
		.query(async ({ input: { huntId }, ctx: { hunter } }) => {
			const { photos, ...hunt } = await db.hunt.findUniqueOrThrow({
				where: { id: huntId },
				include: huntDisplayInclude,
			});

			if (
				hunt.status === HuntStatus.Cancelled ||
				hunt.status === HuntStatus.Pending
			) {
				throw new TRPCError({ code: 'NOT_FOUND' });
			}

			const hunterIdsInHunt = await hunterIdsByHunt(huntId);

			// If not available, check if the hunter is part of the hunt.
			if (
				hunt.status !== HuntStatus.Available &&
				!hunterIdsInHunt.includes(hunter.id)
			) {
				throw new TRPCError({ code: 'NOT_FOUND' });
			}

			const hunters = await db.hunter.findMany({
				where: { id: { in: hunterIdsInHunt } },
				include: { avatar: true },
			});

			return {
				...hunt,
				hunters,
				photos: photosFromHunter(photos, hunter.id),
			};
		}),

	join: userProcedure.input(z.object({ huntId: idSchemaCoerce })).mutation(
		async ({
			ctx: {
				hunter: currentHunter,
				user: { code },
				admin,
				req: { log },
			},
			input: { huntId },
		}) => {
			assertHuntsEnabled(code, admin);

			const hunterId = currentHunter.id;
			let existingSpot = await spotByHunter(hunterId, huntId);
			const hunt = await db.hunt.findUniqueOrThrow({
				where: { id: huntId },
			});

			// If we already joined, leave the hunt.
			if (existingSpot?.status === SpotStatus.Taken) {
				if (huntInLockdown(hunt)) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Cannot leave before hunt',
					});
				}

				await clearHuntSpot(existingSpot.id);

				log.info(`${currentHunter.name} canceled hunt with ID ${huntId}`);
				notifyHuntsReload();
				return { accepted: false, huntId };
			}

			if (existingSpot) {
				await db.huntSpot.update({
					where: { id: existingSpot.id },
					data: { status: SpotStatus.Taken },
				});
			} else {
				const claimedSpot = await claimHuntSpot(huntId, hunterId);
				if (!claimedSpot) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Hunt is already full',
					});
				} else {
					existingSpot = claimedSpot;
				}
			}

			log.info(`${currentHunter.name} accepted hunt with ID ${huntId}`);

			notifyHuntsReload();

			// Notify the inviter.
			if (existingSpot.fromHunterId) {
				const inviter = await db.hunter.findUnique({
					where: { id: existingSpot.fromHunterId },
				});
				if (inviter) {
					await notifyHunter({
						event: inviteResponseEvent({
							fromHunter: currentHunter,
							hunt,
							response: 'accept',
						}),
						hunter: inviter,
					});
				}
			}

			// Get group hunter IDs that can be invited to the hunt.
			let invitees: number[] = [];
			if (currentHunter.groupId) {
				const groupHunters = await huntersFromGroupId(currentHunter.groupId);
				const groupHunterIds = extractIds(groupHunters);

				invitees = await hunterIdsToInvite(huntId, groupHunterIds);
			}

			return {
				accepted: true,
				huntId,
				invitees,
			};
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
		.mutation(
			async ({
				ctx: {
					hunter,
					user: { code },
					admin,
				},
				input,
			}) => {
				assertHuntsEnabled(code, admin);

				const { huntId, name, photo } = input;
				const bytes = await photo.bytes();
				const result = await uploadPhoto({
					buffer: bytes,
					hunterId: hunter.id,
					huntId,
					name,
				});

				return { id: result.id };
			},
		),
});
