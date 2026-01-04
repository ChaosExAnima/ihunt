import { HuntInvite } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { TRPCError } from '@trpc/server';
import * as z from 'zod';

import { HUNT_INVITE_TIME } from '@/lib/constants';
import { MINUTE } from '@/lib/formats';
import { idArray, idSchemaCoerce } from '@/lib/schemas';
import { db } from '@/server/lib/db';
import { expireInvites, fetchInviteesForHunt } from '@/server/lib/invite';
import { InviteStatus } from '@/server/lib/schema';
import { router, userProcedure } from '@/server/lib/trpc';

import { handleError } from '../lib/error';

export const inviteRouter = router({
	availableInvitees: userProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
			}),
		)
		.output(idArray)
		.query(async ({ ctx: { hunter }, input: { huntId } }) => {
			// No group means nobody to invite.
			if (!hunter.groupId) {
				return [];
			}

			try {
				// Load the hunt and check if we're already full.
				const hunt = await db.hunt.findUniqueOrThrow({
					include: {
						hunters: {
							select: { id: true },
						},
					},
					where: { id: huntId },
				});

				if (hunt.hunters.length >= hunt.maxHunters) {
					return [];
				}

				// Get the invitees
				const invitees = await fetchInviteesForHunt({
					fromHunterId: hunter.id,
					groupId: hunter.groupId,
					huntId,
				});

				return invitees;
			} catch (err) {
				handleError({ err });
				return [];
			}
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
			try {
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
			} catch (err) {
				handleError({ err });
				return { success: false };
			}
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
					} else {
						handleError({ err });
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
