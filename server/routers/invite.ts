import { HuntInvite } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { TRPCError } from '@trpc/server';
import z from 'zod';

import { HUNT_INVITE_TIME } from '@/lib/constants';
import { MINUTE } from '@/lib/formats';
import { idSchemaCoerce } from '@/lib/schemas';
import { extractIds } from '@/lib/utils';

import { db } from '../db';
import { expireInvites, fetchInviteesForHunt } from '../invite';
import { InviteStatus } from '../schema';
import { router, userProcedure } from '../trpc';

export const inviteRouter = router({
	availableInvitees: userProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
			}),
		)
		.query(async ({ ctx: { hunter }, input: { huntId } }) => {
			if (!hunter.groupId) {
				return {
					count: 0,
					invitees: [],
					unavailable: [],
				};
			}
			const group = await db.hunterGroup.findUniqueOrThrow({
				include: {
					hunters: {
						select: { id: true },
					},
				},
				where: { id: hunter.groupId },
			});

			// Get the invitees
			const groupHunterIds = extractIds(group.hunters);
			const invitees = await fetchInviteesForHunt({
				fromHunterId: hunter.id,
				groupId: hunter.groupId,
				huntId,
			});
			return {
				count: invitees.length,
				invitees,
				unavailable: groupHunterIds.filter(
					(id) => !invitees.includes(id),
				),
			};
		}),

	getInvites: userProcedure.query(async ({ ctx: { hunter } }) => {
		const invites = await db.huntInvite.findMany({
			where: {
				status: InviteStatus.Pending,
				toHunterId: hunter.id,
			},
		});

		return expireInvites(invites);
	}),

	rejectInvite: userProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
			}),
		)
		.mutation(async ({ ctx: { hunter }, input: { huntId } }) => {
			await db.huntInvite.updateMany({
				data: {
					status: InviteStatus.Rejected,
				},
				where: {
					huntId,
					status: InviteStatus.Pending,
					toHunterId: hunter.id,
				},
			});

			return { success: true };
		}),

	sendInvites: userProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
			}),
		)
		.mutation(async ({ ctx: { hunter }, input: { huntId } }) => {
			if (!hunter.groupId) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You are not in a group',
				});
			}

			// Get the invitees
			const invites: HuntInvite[] = [];
			const invitees = await fetchInviteesForHunt({
				fromHunterId: hunter.id,
				groupId: hunter.groupId,
				huntId,
			});

			// Try to create the invites
			const expiresAt = new Date(Date.now() + MINUTE * HUNT_INVITE_TIME);
			for (const inviteeId of invitees) {
				try {
					const invite = await db.huntInvite.create({
						data: {
							expiresAt,
							fromHunterId: hunter.id,
							huntId,
							toHunterId: inviteeId,
						},
					});
					invites.push(invite);
				} catch (err) {
					if (
						err instanceof PrismaClientKnownRequestError &&
						err.code === 'P2002'
					) {
						continue;
					}
				}
			}

			if (invites.length === 0) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Nobody left to invite today',
				});
			}

			// TODO: Send notifications here

			return {
				count: invites.length,
			};
		}),
});
