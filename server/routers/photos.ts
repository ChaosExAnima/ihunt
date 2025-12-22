import z from 'zod';

import { idSchema, posIntSchema } from '@/lib/schemas';

import { db } from '../db';
import { outputPhoto } from '../photo';
import { router, userProcedure } from '../trpc';

const resizingTypeSchema = z.enum([
	'fill',
	'fit',
	'fill-down',
	'force',
	'auto',
]);

export const photosRouter = router({
	get: userProcedure
		.input(
			z.object({
				height: posIntSchema.optional(),
				id: idSchema,
				resizing_type: resizingTypeSchema.optional(),
				width: posIntSchema.optional(),
			}),
		)
		.query(async ({ input: { id, ...options } }) => {
			const photo = await db.photo.findFirstOrThrow({
				where: { id },
			});
			return outputPhoto({ photo, ...options });
		}),

	getSizes: userProcedure
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
			const photo = await db.photo.findFirstOrThrow({
				where: { id },
			});
			return sizes.map((size) =>
				outputPhoto({ photo, ...size, ...options }),
			);
		}),
});
