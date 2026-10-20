import { HuntStatus } from '@ihunt/lib/constants';
import {
	groupSchema,
	hunterSchema,
	hunterTypeSchema,
	idSchemaCoerce,
} from '@ihunt/lib/schemas';
import { TRPCError } from '@trpc/server';
import * as z from 'zod';

import { config } from '../lib/config';
import { db } from '../lib/db';
import { outputHuntSchema } from '../lib/schema';
import { debugProcedure, router, userProcedure } from '../lib/trpc';

export const hunterRouter = router({
	getGroup: userProcedure
		.input(
			z
				.object({
					hunterId: idSchemaCoerce.optional(),
				})
				.optional(),
		)
		.output(groupSchema.nullable())
		.query(async ({ ctx: { hunter }, input }) => {
			const hunterId = input?.hunterId ?? hunter.id;
			if (!hunterId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'No hunter provided',
				});
			}

			const group = await db.hunterGroup.findFirst({
				include: {
					hunters: {
						include: {
							avatar: true,
						},
					},
				},
				where: {
					hunters: {
						some: {
							id: hunterId,
						},
					},
				},
			});
			if (!group) {
				return null;
			}
			return {
				...group,
				hunters: group?.hunters.filter(({ id }) => id !== hunterId),
			};
		}),

	getMany: debugProcedure.query(async ({ ctx: { hunter: currentHunter } }) => {
		const hunters = await db.hunter.findMany({
			orderBy: {
				handle: 'asc',
			},
			where: {
				alive: true,
				userId: {
					not: null,
				},
			},
		});

		if (config.adminHunterId) {
			hunters.push(
				await db.hunter.findUniqueOrThrow({
					where: { id: config.adminHunterId },
				}),
			);
		}

		return hunters.map(({ handle, id }) => ({
			handle,
			id,
			me: id === currentHunter?.id,
		}));
	}),

	getList: userProcedure.output(hunterSchema.array()).query(async () => {
		return db.hunter.findMany({
			include: {
				avatar: true,
			},
			orderBy: [
				{
					rating: 'desc',
				},
				{
					handle: 'asc',
				},
			],
		});
	}),

	getOne: userProcedure
		.input(
			z.object({
				hunterId: idSchemaCoerce,
			}),
		)
		.output(
			hunterSchema.extend({
				alive: z.boolean(),
				groupId: idSchemaCoerce.nullish(),
				hunts: outputHuntSchema.omit({ photos: true, spots: true }).array(),
			}),
		)
		.query(async ({ input: { hunterId: id } }) => {
			const hunter = await db.hunter.findUniqueOrThrow({
				where: { id },
				include: { avatar: true },
			});

			const hunts = await db.hunt.findMany({
				where: {
					spots: { some: { hunterId: id } },
					status: HuntStatus.Complete,
				},
			});

			return {
				...hunter,
				type: hunterTypeSchema.parse(hunter.type),
				hunts,
			};
		}),
});
