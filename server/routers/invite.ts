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
import { inviteSendEvent, notifyHunter } from '../lib/notify';
import { InviteStatus } from '../lib/schema';
import { adminProcedure, router, userProcedure } from '../lib/trpc';

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

			// Expire all invites if this was the last rejection.
			const pendingInvitesCount = await db.huntHunter.count({
				where: {
					huntId,
					status: InviteStatus.Pending,
				},
			});
			if (!pendingInvitesCount) {
				await db.huntHunter.updateMany({
					where: {
						huntId,
						status: InviteStatus.Rejected,
					},
					data: {
						expiresAt: null,
						status: InviteStatus.Expired,
						// Leave fromHunterId so we know there's been an invite in the past.
					},
				});
			}

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

				for (const invitee of invitees) {
					try {
						const hunterId = invitee.id;
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
						await notifyHunter({
							event,
							hunter: invitee,
						});
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

	resetInvites: adminProcedure
		.input(
			z.object({
				huntIds: idSchemaCoerce.array(),
				force: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input: { huntIds, force } }) => {
			await db.huntHunter.updateMany({
				where: {
					huntId: {
						in: huntIds,
					},
					status: !force
						? {
								not: InviteStatus.Accepted,
							}
						: undefined,
				},
				data: {
					expiresAt: null,
					fromHunterId: null,
					status: InviteStatus.Expired,
				},
			});
		}),
});
