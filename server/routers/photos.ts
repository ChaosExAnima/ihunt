import z from 'zod';

import { idSchema } from '@/lib/schemas';

import { db } from '../db';
import { outputPhoto } from '../photo';
import { router, userProcedure } from '../trpc';

export const photosRouter = router({
	get: userProcedure
		.input(
			z.object({
				height: z.number().int().positive().optional(),
				id: idSchema,
				resizing_type: z
					.enum(['fill', 'fit', 'fill-down', 'force', 'auto'])
					.optional(),
				width: z.number().int().positive().optional(),
			}),
		)
		.query(async ({ input: { id, ...options } }) => {
			const photo = await db.photo.findFirstOrThrow({
				where: { id },
			});
			return outputPhoto({ photo, ...options });
		}),
});
