import { HuntInvite } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { TRPCError } from '@trpc/server';
import z from 'zod';

import { HUNT_MAX_PER_DAY } from '@/lib/constants';
import { huntsTodayCount, todayStart } from '@/lib/formats';
import { idSchemaCoerce } from '@/lib/schemas';

import { db } from '../db';
import { InviteStatus } from '../schema';
import { router, userProcedure } from '../trpc';

export const inviteRouter = router({
	getInvites: userProcedure.query(async ({ ctx: { hunter } }) => {
		return db.huntInvite.findMany({
			where: {
				status: InviteStatus.Pending,
				toHunterId: hunter.id,
			},
		});
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

			// Get the stuff we need
			const hunt = await db.hunt.findFirstOrThrow({
				where: { id: huntId },
			});
			const group = await db.hunterGroup.findFirstOrThrow({
				include: {
					hunters: {
						include: {
							hunts: {
								select: {
									id: true,
									status: true,
								},
								where: {
									scheduledAt: {
										gte: new Date(todayStart()),
									},
								},
							},
						},
					},
				},
				where: { id: hunter.groupId },
			});
			const oldInvites = await db.huntInvite.findMany({
				where: {
					fromHunterId: hunter.id,
					huntId: hunt.id,
				},
			});

			// Create the invites
			const invites: HuntInvite[] = [];
			for (const invitee of group.hunters) {
				// Not yourself, already invited, or on too many hunts today
				if (
					invitee.id === hunter.id ||
					oldInvites.some(
						(invite) => invite.toHunterId === invite.id,
					) ||
					huntsTodayCount(invitee.hunts) >= HUNT_MAX_PER_DAY
				) {
					continue;
				}
				try {
					const invite = await db.huntInvite.create({
						data: {
							fromHunterId: hunter.id,
							huntId: hunt.id,
							toHunterId: invitee.id,
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
