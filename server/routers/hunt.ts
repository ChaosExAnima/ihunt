import { TRPCError } from '@trpc/server';
import * as z from 'zod';

import { HuntStatus } from '@/lib/constants';
import { huntReservedSchema, idSchemaCoerce } from '@/lib/schemas';

import { db } from '../lib/db';
import {
	assertHuntsEnabled,
	huntDisplayInclude,
	isHuntsDisabled,
} from '../lib/hunt';
import { huntInLockdown } from '../lib/hunt';
import { fetchDailyHuntCount, respondToInvite } from '../lib/invite';
import { notifyHuntsReload } from '../lib/notify';
import { uploadPhoto } from '../lib/photo';
import { InviteStatus, outputHuntSchema } from '../lib/schema';
import { router, userProcedure } from '../lib/trpc';

export const huntRouter = router({
	getActive: userProcedure.output(outputHuntSchema.array()).query(
		async ({
			ctx: {
				hunter: { id },
			},
		}) => {
			if (isHuntsDisabled()) {
				return [];
			}
			const hunts = await db.hunt.findMany({
				include: huntDisplayInclude,
				where: {
					huntHunters: {
						some: {
							hunterId: id,
							status: InviteStatus.Accepted,
						},
					},
					status: HuntStatus.Active,
				},
			});

			return hunts.map(({ huntHunters, ...hunt }) => ({
				...hunt,
				hunters: huntHunters.map(({ hunter }) => hunter),
			}));
		},
	),

	getAvailable: userProcedure
		.output(outputHuntSchema.array())
		.query(async ({ ctx: { hunter: currentHunter } }) => {
			if (isHuntsDisabled()) {
				return [];
			}

			const hunts = await db.hunt.findMany({
				include: huntDisplayInclude,
				orderBy: {
					createdAt: 'desc',
				},
				where: {
					status: HuntStatus.Available,
				},
			});

			return hunts.map(({ huntHunters, ...hunt }) => {
				const invite = huntHunters.find(
					({ hunterId }) => currentHunter.id === hunterId,
				);
				return {
					...hunt,
					hunters: huntHunters.map(({ hunter }) => hunter),
					reserved: huntReservedSchema.optional().parse(invite),
				};
			});
		}),

	getCompleted: userProcedure
		.output(outputHuntSchema.array())
		.query(async ({ ctx: { hunter } }) => {
			const hunts = await db.hunt.findMany({
				include: huntDisplayInclude,
				orderBy: {
					completedAt: 'desc',
				},
				where: {
					huntHunters: {
						some: {
							hunter: {
								id: hunter.id,
							},
						},
					},
					status: HuntStatus.Complete,
				},
			});

			return hunts.map(({ huntHunters, ...hunt }) => ({
				...hunt,
				hunters: huntHunters.map(({ hunter }) => hunter),
			}));
		}),

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
		.query(async ({ input: { huntId: id } }) => {
			const { huntHunters, ...hunt } = await db.hunt.findUniqueOrThrow({
				include: huntDisplayInclude,
				where: { id },
			});

			return {
				...hunt,
				hunters: huntHunters.map(({ hunter }) => hunter),
			};
		}),

	getPublic: userProcedure
		.output(outputHuntSchema.array())
		.query(async () => {
			if (isHuntsDisabled()) {
				return [];
			}

			const hunts = await db.hunt.findMany({
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

			return hunts.map(({ huntHunters, ...hunt }) => ({
				...hunt,
				hunters: huntHunters.map(({ hunter }) => hunter),
			}));
		}),

	join: userProcedure.input(z.object({ huntId: idSchemaCoerce })).mutation(
		async ({
			ctx: {
				hunter: currentHunter,
				req: { log },
			},
			input: { huntId },
		}) => {
			assertHuntsEnabled();

			const hunterId = currentHunter.id;
			const hunt = await db.hunt.findUniqueOrThrow({
				where: {
					id: huntId,
				},
				include: {
					huntHunters: true,
				},
			});
			const invite = hunt.huntHunters.find(
				(huntHunter) => hunterId === huntHunter.hunterId,
			);

			// If we already joined, leave the hunt.
			if (invite?.status === InviteStatus.Accepted) {
				if (huntInLockdown(hunt)) {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: 'Cannot leave before hunt',
					});
				}
				log.info(
					`${currentHunter.name} canceled hunt with ID ${huntId}`,
				);
				notifyHuntsReload();
				return { accepted: false, huntId };
			}

			// Calculate the remaining spots, including invites.
			let joinedCount = 0;
			let invitedCount = 0;
			for (const invite of hunt.huntHunters) {
				if (invite.status === InviteStatus.Accepted) {
					joinedCount++;
				} else if (invite.status === InviteStatus.Pending) {
					invitedCount++;
				}
			}

			if (
				joinedCount >= hunt.maxHunters ||
				(joinedCount + invitedCount >= hunt.maxHunters &&
					invite?.status !== InviteStatus.Pending)
			) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Hunt is already full',
				});
			}

			// Join the hunt.
			await db.huntHunter.upsert({
				where: {
					huntId_hunterId: {
						hunterId: currentHunter.id,
						huntId,
					},
				},
				update: {
					status: InviteStatus.Accepted,
				},
				create: {
					hunterId: currentHunter.id,
					huntId,
					status: InviteStatus.Accepted,
				},
			});
			log.info(`${currentHunter.name} accepted hunt with ID ${huntId}`);

			notifyHuntsReload();

			await respondToInvite({
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
