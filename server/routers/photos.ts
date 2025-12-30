import { TRPCError } from '@trpc/server';
import z from 'zod';

import { HuntStatus } from '@/lib/constants';
import { idSchema, idSchemaCoerce, posIntSchema } from '@/lib/schemas';
import { db } from '@/server/lib/db';
import { outputPhoto, photoUrl, uploadPhoto } from '@/server/lib/photo';
import { loggedInProcedure, router } from '@/server/lib/trpc';

const resizingTypeSchema = z.enum([
	'fill',
	'fit',
	'fill-down',
	'force',
	'auto',
]);

export const photosRouter = router({
	delete: loggedInProcedure
		.input(z.object({ id: idSchema }))
		.mutation(async ({ ctx: { admin, hunter }, input: { id } }) => {
			const photo = await db.photo.findUniqueOrThrow({
				select: { hunterId: true },
				where: { id },
			});
			if (hunter?.id !== photo.hunterId && !admin) {
				throw new TRPCError({ code: 'FORBIDDEN' });
			}
			await db.photo.delete({ where: { id } });
		}),

	get: loggedInProcedure
		.input(
			z.object({
				height: posIntSchema.optional(),
				id: idSchema,
				resizing_type: resizingTypeSchema.optional(),
				width: posIntSchema.optional(),
			}),
		)
		.query(async ({ input: { id, ...options } }) => {
			const photo = await db.photo.findUniqueOrThrow({
				where: { id },
			});
			return outputPhoto({ photo, ...options });
		}),

	getSizes: loggedInProcedure
		.input(
			z.object({
				id: idSchema,
				resizing_type: resizingTypeSchema,
				sizes: z
					.array(
						z.object({
							height: posIntSchema,
							width: posIntSchema,
						}),
					)
					.min(1),
			}),
		)
		.query(async ({ input: { id, sizes, ...options } }) => {
			const photo = await db.photo.findUniqueOrThrow({
				where: { id },
			});
			return sizes.map((size) =>
				outputPhoto({ photo, ...size, ...options }),
			);
		}),

	upload: loggedInProcedure
		.input(
			z.instanceof(FormData).transform((fd) =>
				z
					.object({
						hunterId: idSchemaCoerce.optional(),
						huntId: idSchemaCoerce.optional(),
						photo: z.instanceof(File),
					})
					.parse(Object.fromEntries(fd.entries())),
			),
		)
		.mutation(async ({ ctx, input }) => {
			const { admin, hunter } = ctx;
			const { huntId, photo } = input;
			let hunterId = hunter?.id;
			if (admin) {
				hunterId = input.hunterId;
			} else if (!hunterId) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'No hunter found',
				});
			}

			if (!huntId && !hunterId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Must provide a hunt or hunter or both',
				});
			}

			// Check if the hunter is part of the hunt and it's finished.
			if (huntId && hunterId && !admin) {
				const hunt = await db.hunt.findUniqueOrThrow({
					include: {
						hunters: {
							select: {
								id: true,
							},
						},
					},
					where: { id: huntId },
				});
				if (hunt.status !== HuntStatus.Active) {
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: 'Hunt must be active to upload photos',
					});
				}
				if (!hunt.hunters.find(({ id }) => id === hunterId)) {
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: 'You must be involved with this hunt',
					});
				}
			}

			try {
				const result = await uploadPhoto({
					buffer: await photo.bytes(),
					hunterId,
					huntId,
					name: photo.name,
				});

				if (hunterId && !huntId) {
					await db.hunter.update({
						data: {
							avatarId: result.id,
						},
						where: { id: hunterId },
					});
				}

				return {
					...result,
					url: photoUrl(result),
				};
			} catch (err) {
				if (err instanceof TRPCError) {
					throw err;
				}
				throw new TRPCError({
					cause: err,
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Could not upload this photo',
				});
			}
		}),
});
