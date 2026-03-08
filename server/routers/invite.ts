import { TRPCError } from '@trpc/server';
import * as z from 'zod';

import { HUNT_INVITE_MINUTES, HuntStatus } from '@/lib/constants';
import { MINUTE } from '@/lib/formats';
import { idArray, idSchemaCoerce } from '@/lib/schemas';
import { extractIds } from '@/lib/utils';

import { PrismaClientKnownRequestError } from '../../prisma/generated/internal/prismaNamespace';
import { db } from '../lib/db';
import { huntInLockdown, isHuntsDisabled } from '../lib/hunt';
import {
	expireInvites,
	fetchInviteesForHunt,
	respondToInvite,
} from '../lib/invite';
import { inviteSendEvent, notifyUser } from '../lib/notify';
import { InviteStatus } from '../lib/schema';
import { router, userProcedure } from '../lib/trpc';

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
			if (!hunter.groupId || isHuntsDisabled()) {
				return [];
			}

			// Load the hunt and check if we're already full.
			const hunt = await db.hunt.findUniqueOrThrow({
				include: {
					huntHunters: true,
				},
				where: { id: huntId },
			});

			if (
				hunt.huntHunters.length >= hunt.maxHunters ||
				!hunt.huntHunters.some(
					({ hunterId, status }) =>
						hunterId === hunter.id &&
						status === InviteStatus.Accepted,
				)
			) {
				return [];
			}

			if (huntInLockdown(hunt)) {
				return [];
			}

			// Get the invitees
			const invitees = await fetchInviteesForHunt({
				fromHunterId: hunter.id,
				groupId: hunter.groupId,
				huntId,
			});

			return extractIds(invitees);
		}),

	getInvites: userProcedure.query(async ({ ctx: { hunter } }) => {
		const invites = await db.huntHunter.findMany({
			where: {
				status: InviteStatus.Pending,
				hunterId: hunter.id,
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
			const success = await respondToInvite({
				currentHunter: hunter,
				huntId,
				response: 'decline',
			});
			return {
				success,
			};
		}),

	sendInvites: userProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
			}),
		)
		.mutation(
			async ({ ctx: { hunter: currentHunter }, input: { huntId } }) => {
				if (!currentHunter.groupId) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'You are not in a group',
					});
				}

				// Prevent creating invites when hunt is locked down or unavailable.
				const hunt = await db.hunt.findUniqueOrThrow({
					where: {
						id: huntId,
					},
				});
				if (
					hunt.status !== HuntStatus.Available ||
					huntInLockdown(hunt)
				) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Hunt cannot have invites',
					});
				}

				const invitees = await fetchInviteesForHunt({
					fromHunterId: currentHunter.id,
					groupId: currentHunter.groupId,
					huntId,
				});

				if (invitees.length === 0) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Nobody left to invite today',
					});
				}

				const expiresAt = new Date(
					Date.now() + MINUTE * HUNT_INVITE_MINUTES,
				);
				const event = inviteSendEvent({
					fromHunter: currentHunter,
					hunt,
				});

				for (const { id: hunterId, userId } of invitees) {
					try {
						await db.huntHunter.upsert({
							where: {
								huntId_hunterId: {
									hunterId,
									huntId,
								},
							},
							create: {
								expiresAt,
								fromHunterId: currentHunter.id,
								huntId,
								hunterId,
								status: InviteStatus.Pending,
							},
							update: {
								expiresAt,
								fromHunterId: currentHunter.id,
								status: InviteStatus.Pending,
							},
						});
						if (userId) {
							await notifyUser({
								event,
								userId,
							});
						}
					} catch (err) {
						if (
							err instanceof PrismaClientKnownRequestError &&
							err.code === 'P2002'
						) {
							continue;
						}
						throw err;
					}
				}

				return {
					count: invitees.length,
				};
			},
		),
});
