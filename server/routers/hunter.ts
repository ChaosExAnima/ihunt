import z from 'zod';

import { HuntStatus } from '@/lib/constants';
import { db } from '@/lib/db';
import { idSchema } from '@/lib/schemas';

import { authedProcedure, router } from '../trpc';

export const hunterRouter = router({
	getOne: authedProcedure
		.input(
			z.object({
				id: idSchema,
			}),
		)
		.query(async ({ input }) => {
			const { id } = input;

			const hunter = await db.hunter.findFirstOrThrow({
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
						some: {
							id: hunter.id,
						},
					},
				},
			});

			return {
				...hunter,
				rating: rating._avg.rating ?? 0,
			}
		}),
});
