import z from 'zod';

import { HuntStatus } from '@/lib/constants';
import { idSchema, idSchemaCoerce } from '@/lib/schemas';

import { db } from '../db';
import { uploadPhoto } from '../photo';
import { outputHunterSchema, outputHuntSchema } from '../schema';
import { adminProcedure, photoProcedure, router } from '../trpc';

export const hunterRouter = router({
	getOne: photoProcedure
		.input(
			z.object({
				hunterId: idSchema,
			}),
		)
		.output(
			outputHunterSchema.merge(
				z.object({
					count: z.number().positive().int(),
					followers: z.array(outputHunterSchema),
					hunts: z.array(
						outputHuntSchema.omit({ hunters: true, photos: true }),
					),
					rating: z.number().positive().int(),
				}),
			),
		)
		.query(async ({ input: { hunterId: id } }) => {
			const {
				_count: { hunts: count },
				...hunter
			} = await db.hunter.findFirstOrThrow({
				include: {
					_count: {
						select: {
							hunts: {
								where: {
									status: HuntStatus.Complete,
								},
							},
						},
					},
					avatar: true,
					followers: {
						include: {
							avatar: true,
						},
					},
					hunts: {
						where: {
							status: HuntStatus.Complete,
						},
					},
				},
				where: { id },
			});
			const rating = await db.hunt.aggregate({
				_avg: {
					rating: true,
				},
				where: {
					hunters: {
						some: { id },
					},
				},
			});

			return {
				...hunter,
				count,
				rating: rating._avg.rating ?? 1,
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
