import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import z from 'zod';

import { huntDisplayInclude, HuntStatus } from '@/lib/constants';
import {
	HuntReservedSchema,
	HuntReservedStatusSchema,
	idSchemaCoerce,
} from '@/lib/schemas';
import { db } from '@/server/lib/db';
import {
	expireInvites,
	fetchDailyHuntCount,
	fetchUnclaimedSpots,
} from '@/server/lib/invite';
import { uploadPhoto } from '@/server/lib/photo';
import { InviteStatus, outputHuntSchema } from '@/server/lib/schema';
import { adminProcedure, router, userProcedure } from '@/server/lib/trpc';

import { handleError, wrapRoute } from '../lib/error';

export const huntRouter = router({
	getActive: userProcedure.output(z.array(outputHuntSchema)).query(
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
		.output(z.array(outputHuntSchema))
		.query(async ({ ctx: { hunter: currentHunter } }) => {
			try {
				const result = await db.hunt.findMany({
					include: {
						...huntDisplayInclude,
						invites: {
							where: {
								status: InviteStatus.Pending,
							},
						},
					},
					orderBy: {
						createdAt: 'desc',
					},
					where: {
						status: HuntStatus.Available,
					},
				});

				const invites = await expireInvites(
					result.flatMap(({ invites }) => invites),
				);
				const invitedHuntMap = new Map<number, HuntReservedSchema>();
				for (const invite of invites) {
					const mapData = invitedHuntMap.get(invite.huntId);
					let status: HuntReservedStatusSchema =
						mapData?.status ?? 'reserved';

					if (invite.fromHunterId === currentHunter.id) {
						status = 'sent';
					} else if (
						invite.toHunterId === currentHunter.id &&
						status !== 'sent'
					) {
						status = 'invited';
					}
					invitedHuntMap.set(invite.huntId, {
						expires: invite.expiresAt,
						status,
					});
				}

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
		.output(z.array(outputHuntSchema))
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

	getPublic: userProcedure.output(z.array(outputHuntSchema)).query(() =>
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
				const { hunt, invitedCount, joined, joinedCount } =
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

				if (joinedCount + invitedCount >= hunt.maxHunters) {
					throw new Error('Hunt is already full');
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

				// Update the invite to show the hunter accepted.
				const invite = hunt.invites.find(
					(invite) => invite.toHunterId === currentHunter.id,
				);
				if (invite) {
					await db.huntInvite.update({
						data: {
							status: InviteStatus.Accepted,
						},
						where: {
							id: invite.id,
						},
					});
				}

				return { accepted: true, huntId };
			} catch (err: unknown) {
				if (err instanceof TRPCError) {
					throw err;
				}
				let message = 'Unknown issue joining the hunt';
				if (err instanceof Prisma.PrismaClientKnownRequestError) {
					if (err.code === 'P2001' || err.code === 'P2015') {
						throw new TRPCError({
							cause: err,
							code: 'NOT_FOUND',
							message: 'Could not find requested information',
						});
					}
					throw new TRPCError({
						cause: err,
						code: 'INTERNAL_SERVER_ERROR',
						message,
					});
				}
				if (err instanceof Error && err.message) {
					message = err.message;
				}
				throw new TRPCError({
					code: 'FORBIDDEN',
					message,
				});
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
