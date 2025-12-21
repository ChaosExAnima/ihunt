import z from 'zod';

import { userSchema } from '@/admin/user/common';
import { hunterSchema, huntSchema, idSchema } from '@/lib/schemas';

import { db } from '../db';
import { adminProcedure, router } from '../trpc';

export const adminRouter = router({
	create: adminProcedure
		.input(
			z.discriminatedUnion('resource', [
				z.object({
					params: huntSchema.omit({
						hunters: true,
						id: true,
						photos: true,
					}),
					resource: z.literal('hunt'),
				}),
				z.object({
					params: hunterSchema.omit({
						avatar: true,
						id: true,
					}),
					resource: z.literal('hunter'),
				}),
				z.object({
					params: userSchema,
					resource: z.literal('user'),
				}),
			]),
		)
		.mutation(async ({ input: { params, resource } }) => {
			switch (resource) {
				case 'hunt':
					return await db.hunt.create({ data: params });
				case 'hunter':
					return await db.hunter.create({ data: params });
				case 'user':
					return await db.user.create({
						data: { ...params, password: '' },
					});
			}
		}),
	delete: adminProcedure
		.input(
			z.object({
				id: idSchema,
				resource: z.enum(['hunt', 'hunter', 'user', 'photo']),
			}),
		)
		.mutation(async ({ input: { id, resource } }) => {
			switch (resource) {
				case 'hunt':
					return db.hunt.delete({ where: { id } });
				case 'hunter':
					return db.hunter.delete({ where: { id } });
				case 'photo':
					return db.photo.delete({ where: { id } });
				case 'user':
					return db.user.delete({ where: { id } });
			}
		}),
});
