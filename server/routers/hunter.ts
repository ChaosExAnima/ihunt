import { TRPCError } from '@trpc/server';
import z from 'zod';

import { HuntStatus } from '@/lib/constants';
import {
	groupSchema,
	hunterSchema,
	hunterTypeSchema,
	idSchemaCoerce,
} from '@/lib/schemas';
import { db } from '@/server/lib/db';
import { uploadPhoto } from '@/server/lib/photo';
import { outputHuntSchema } from '@/server/lib/schema';
import {
	adminProcedure,
	debugProcedure,
	router,
	userProcedure,
} from '@/server/lib/trpc';

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

	getMany: debugProcedure.query(
		async ({ ctx: { hunter: currentHunter } }) => {
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

			return hunters.map(({ handle, id }) => ({
				handle,
				id,
				me: id === currentHunter?.id,
			}));
		},
	),

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
				hunts: z.array(
					outputHuntSchema.omit({ hunters: true, photos: true }),
				),
			}),
		)
		.query(async ({ input: { hunterId: id } }) => {
			const hunter = await db.hunter.findUniqueOrThrow({
				include: {
					avatar: true,
					hunts: {
						where: {
							status: HuntStatus.Complete,
						},
					},
				},
				where: { id },
			});

			return {
				...hunter,
				type: hunterTypeSchema.parse(hunter.type),
			};
		}),

	updateAvatar: adminProcedure
		.input(
			z.instanceof(FormData).transform((fd) =>
				z
					.object({
						hunterId: idSchemaCoerce,
						photo: z.instanceof(File),
					})
					.parse(Object.fromEntries(fd.entries())),
			),
		)
		.mutation(async ({ input: { hunterId, photo } }) => {
			try {
				const result = await uploadPhoto({
					buffer: await photo.bytes(),
					hunterId,
					name: photo.name,
				});
				return { success: true, ...result };
			} catch (error) {
				console.error('Error uploading avatar:', error);
				return { success: false };
			}
		}),
});
