import { SpotStatus } from '@ihunt/lib/constants';
import { idArray, idSchemaCoerce } from '@ihunt/lib/schemas';
import { extractIds } from '@ihunt/lib/utils';
import { TRPCError } from '@trpc/server';
import * as z from 'zod';

import { db } from '../lib/db';
import { huntersFromGroupId } from '../lib/hunter';
import { inviteHunters } from '../lib/invite';
import { clearHuntSpot, spotByHunter } from '../lib/spot';
import { adminProcedure, router, userProcedure } from '../lib/trpc';

export const inviteRouter = router({
	rejectInvite: userProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
			}),
		)
		.mutation(async ({ ctx: { hunter }, input: { huntId } }) => {
			const spot = await spotByHunter(hunter.id, huntId);
			if (spot?.status !== SpotStatus.Locked) {
				return { success: false };
			}

			await clearHuntSpot(spot.id);

			return { success: true };
		}),

	sendInvitesToHunters: userProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
				hunterIds: idArray,
			}),
		)
		.mutation(
			async ({
				ctx: { hunter: currentHunter },
				input: { huntId, hunterIds },
			}) => {
				const spots = await inviteHunters(huntId, hunterIds, currentHunter);

				return { count: spots.length };
			},
		),

	sendInvitesToGroup: userProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
			}),
		)
		.mutation(async ({ ctx: { hunter: currentHunter }, input: { huntId } }) => {
			if (!currentHunter.groupId) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You are not in a group',
				});
			}

			const groupHunters = await huntersFromGroupId(currentHunter.groupId);
			const hunterIds = extractIds(groupHunters);
			const spots = await inviteHunters(huntId, hunterIds, currentHunter);
			return { count: spots.length };
		}),

	resetInvites: adminProcedure
		.input(
			z.object({
				huntIds: idSchemaCoerce.array(),
				force: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input: { huntIds, force } }) => {
			await db.huntSpot.updateMany({
				where: {
					huntId: { in: huntIds },
					status: force ? undefined : SpotStatus.Locked,
				},
				data: {
					status: SpotStatus.Empty,
					hunterId: null,
					fromHunterId: null,
				},
			});
		}),
});
