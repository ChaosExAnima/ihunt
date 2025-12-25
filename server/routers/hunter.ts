import z from 'zod';

import { HuntStatus } from '@/lib/constants';
import {
	hunterSchema,
	hunterTypeSchema,
	idSchema,
	idSchemaCoerce,
} from '@/lib/schemas';

import { db } from '../db';
import { uploadPhoto } from '../photo';
import { outputHuntSchema } from '../schema';
import { adminProcedure, router, userProcedure } from '../trpc';

export const hunterRouter = router({
	getOne: userProcedure
		.input(
			z.object({
				hunterId: idSchema,
			}),
		)
		.output(
			hunterSchema.extend({
				hunts: z.array(
					outputHuntSchema.omit({ hunters: true, photos: true }),
				),
			}),
		)
		.query(async ({ input: { hunterId: id } }) => {
			const hunter = await db.hunter.findFirstOrThrow({
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
