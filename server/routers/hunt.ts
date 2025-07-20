import z from 'zod';

import { huntDisplayInclude, HuntStatus } from '@/lib/constants';
import { idSchema, idSchemaCoerce } from '@/lib/schemas';

import { db } from '../db';
import { uploadPhoto } from '../photo';
import { router, userProcedure } from '../trpc';

export const huntRouter = router({
	getActive: userProcedure.query(({ ctx: { hunter } }) => {
		return db.hunt.findMany({
			include: huntDisplayInclude,
			where: {
				hunters: {
					some: {
						id: hunter.id,
					},
				},
				status: HuntStatus.Active,
			},
		});
	}),

	getActiveCount: userProcedure.query(({ ctx: { hunter } }) => {
		return db.hunt.count({
			where: {
				hunters: {
					some: {
						id: hunter.id,
					},
				},
				status: HuntStatus.Active,
			},
		});
	}),

	getAvailable: userProcedure.query(() => {
		return db.hunt.findMany({
			include: huntDisplayInclude,
			where: {
				status: HuntStatus.Available,
			},
		});
	}),

	getCompleted: userProcedure.query(({ ctx: { hunter } }) => {
		return db.hunt.findMany({
			include: huntDisplayInclude,
			where: {
				hunters: {
					some: {
						id: hunter.id,
					},
				},
				status: HuntStatus.Complete,
			},
		});
	}),

	getOne: userProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
			}),
		)
		.query(({ input }) => {
			const { huntId: id } = input;

			return db.hunt.findUnique({
				include: huntDisplayInclude,
				where: { id },
			});
		}),

	getPublic: userProcedure.query(() => {
		return db.hunt.findMany({
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
				status: {
					in: [HuntStatus.Active, HuntStatus.Available],
				},
			},
		});
	}),

	join: userProcedure
		.input(z.object({ huntId: idSchemaCoerce }))
		.mutation(async ({ ctx: { hunter: currentHunter }, input }) => {
			const { huntId: id } = input;
			const hunt = await db.hunt.findFirstOrThrow({
				select: {
					hunters: {
						select: { id: true },
					},
					maxHunters: true,
					status: true,
				},
				where: {
					id,
				},
			});
			if (hunt.status !== HuntStatus.Available) {
				throw new Error(`Hunt ${id} is not open to hunters`);
			}
			if (hunt.hunters.some((hunter) => hunter.id === currentHunter.id)) {
				await db.hunt.update({
					data: {
						hunters: {
							disconnect: {
								id: currentHunter.id,
							},
						},
					},
					where: { id },
				});
				console.log(
					`${currentHunter.name} canceled hunt with ID ${id}`,
				);
				return { accepted: false, huntId: id };
			}
			await db.hunt.update({
				data: {
					hunters: {
						connect: {
							id: currentHunter.id,
						},
					},
				},
				where: { id },
			});
			console.log(`${currentHunter.name} accepted hunt with ID ${id}`);
			return { accepted: true, huntId: id };
		}),

	uploadPhoto: userProcedure
		.input(
			z.instanceof(FormData).transform((fd) => {
				return z
					.object({
						huntId: idSchema.optional(),
						name: z.string().min(1).optional(),
						photo: z.instanceof(File),
					})
					.parse(Object.fromEntries(fd.entries()));
			}),
			// z.preprocess(
			// 	(input: FormData) =>
			// 		input instanceof FormData
			// 			? Object.fromEntries(input.entries())
			// 			: input,
			// z.object({
			// 	huntId: idSchemaCoerce.optional(),
			// 	name: z.string().min(1).optional(),
			// 	// photo: z.file().min(1),
			// }),
			// ),
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
