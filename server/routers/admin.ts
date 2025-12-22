import z from 'zod';

import { userSchema } from '@/admin/user/common';
import {
	hunterSchema,
	huntSchema,
	idSchemaCoerce,
	posIntSchema,
} from '@/lib/schemas';

import { db } from '../db';
import { adminProcedure, router } from '../trpc';

const resourceSchema = z.enum(['hunt', 'hunter', 'user', 'photo']);

const paginationSchema = z.object({
	page: posIntSchema,
	perPage: posIntSchema,
});

const sortSchema = z.object({
	field: z.string(),
	order: z.enum(['ASC', 'DESC']),
});

const findManySchema = z.object({
	ids: z.array(idSchemaCoerce).optional(),
	pagination: paginationSchema.optional(),
	resource: resourceSchema,
	sort: sortSchema.optional(),
});

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
				id: idSchemaCoerce,
				resource: resourceSchema,
			}),
		)
		.mutation(async ({ input: { id, resource } }) => {
			const query = { where: { id } };
			switch (resource) {
				case 'hunt':
					return db.hunt.delete(query);
				case 'hunter':
					return db.hunter.delete(query);
				case 'photo':
					return db.photo.delete(query);
				case 'user':
					return db.user.delete(query);
			}
		}),

	deleteMany: adminProcedure
		.input(
			z.object({
				ids: z.array(idSchemaCoerce),
				resource: resourceSchema,
			}),
		)
		.mutation(async ({ input: { ids, resource } }) => {
			const query = {
				where: {
					id: {
						in: ids,
					},
				},
			};
			switch (resource) {
				case 'hunt': {
					const data = await db.hunt.findMany(query);
					await db.hunt.deleteMany(query);
					return { data };
				}
				case 'hunter': {
					const data = await db.hunter.findMany(query);
					await db.hunter.deleteMany(query);
					return { data };
				}
				case 'photo': {
					const data = await db.photo.findMany(query);
					await db.photo.deleteMany(query);
					return { data };
				}
				case 'user': {
					const data = await db.user.findMany(query);
					await db.user.deleteMany(query);
					return { data };
				}
			}
		}),

	getList: adminProcedure
		.input(findManySchema)
		.query(async ({ input: { ids, pagination, resource, sort } }) => {
			const query = {
				orderBy: sort
					? {
							[sort.field]: sort.order.toLowerCase(),
						}
					: undefined,
				skip: pagination
					? pagination.perPage * (pagination.page - 1)
					: undefined,
				take: pagination?.perPage,
				where: ids
					? {
							id: {
								in: ids,
							},
						}
					: undefined,
			};

			switch (resource) {
				case 'hunt':
					return {
						data: await db.hunt.findMany(query),
						total: await db.hunt.count(),
					};
				case 'hunter':
					return {
						data: await db.hunter.findMany({
							...query,
							include: {
								avatar: true,
							},
						}),
						total: await db.hunter.count(),
					};
				case 'photo':
					return {
						data: await db.photo.findMany({
							...query,
							include: {
								hunter: {
									include: { avatar: true },
								},
							},
						}),
						total: await db.photo.count(),
					};
				case 'user':
					return {
						data: await db.user.findMany({
							...query,
							include: {
								hunters: {
									include: { avatar: true },
									orderBy: {
										alive: 'asc',
									},
								},
							},
							omit: { password: true },
						}),
						total: await db.user.count(),
					};
			}
		}),

	getOne: adminProcedure
		.input(
			z.object({
				id: idSchemaCoerce,
				resource: resourceSchema,
			}),
		)
		.query(async ({ input: { id, resource } }) => {
			const query = { where: { id } };
			switch (resource) {
				case 'hunt':
					return db.hunt.findMany(query);
				case 'hunter':
					return db.hunter.findMany(query);
				case 'photo':
					return db.photo.findMany(query);
				case 'user':
					return db.user.findMany({
						...query,
						include: {
							hunters: {
								include: { avatar: true },
								orderBy: {
									alive: 'asc',
								},
							},
						},
						omit: { password: true },
					});
			}
		}),

	getReferences: adminProcedure
		.input(
			findManySchema
				.omit({ ids: true })
				.merge(z.object({ id: idSchemaCoerce, target: z.string() })),
		)
		.query(
			async ({ input: { id, pagination, resource, sort, target } }) => {
				const where = {
					[target]: id,
				};
				const query = {
					orderBy: sort
						? {
								[sort.field]: sort.order.toLowerCase(),
							}
						: undefined,
					skip: pagination
						? pagination.perPage * (pagination.page - 1)
						: undefined,
					take: pagination?.perPage,
					where,
				};

				switch (resource) {
					case 'hunt':
						return {
							data: await db.hunt.findMany(query),
							total: await db.hunt.count({ where }),
						};
					case 'hunter':
						return {
							data: await db.hunter.findMany({
								...query,
								include: {
									avatar: true,
								},
							}),
							total: await db.hunter.count({ where }),
						};
					case 'photo':
						return {
							data: await db.photo.findMany(query),
							total: await db.photo.count({ where }),
						};
					case 'user':
						return {
							data: await db.user.findMany({
								...query,
								omit: { password: true },
							}),
							total: await db.user.count({ where }),
						};
				}
			},
		),

	isValid: adminProcedure.query(() => true),
});
