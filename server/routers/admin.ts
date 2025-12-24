import { TRPCError } from '@trpc/server';
import z from 'zod';

import { adminCreateInput, adminInput, resourceSchema } from '@/admin/schemas';
import { idSchemaCoerce, posIntSchema } from '@/lib/schemas';
import { extractIds, omit } from '@/lib/utils';

import { db } from '../db';
import { outputPhoto, photoUrl } from '../photo';
import { adminProcedure, router } from '../trpc';

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
		.input(adminCreateInput)
		.mutation(async ({ input: { data, resource } }) => {
			switch (resource) {
				case 'hunt':
					return await db.hunt.create({ data });
				case 'hunter':
					return await db.hunter.create({ data });
				case 'user': {
					return await db.user.create({
						data: { ...data, password: '' },
					});
				}
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
		.mutation(async ({ input: { ids: inIds, resource } }) => {
			const query = {
				where: {
					id: {
						in: inIds,
					},
				},
			};
			let ids = inIds;
			switch (resource) {
				case 'hunt': {
					const data = await db.hunt.findMany(query);
					await db.hunt.deleteMany(query);
					ids = data.map(({ id }) => id);
					break;
				}
				case 'hunter': {
					const data = await db.hunter.findMany(query);
					await db.hunter.deleteMany(query);
					ids = data.map(({ id }) => id);
					break;
				}
				case 'photo': {
					const data = await db.photo.findMany(query);
					await db.photo.deleteMany(query);
					ids = data.map(({ id }) => id);
					break;
				}
				case 'user': {
					const data = await db.user.findMany(query);
					await db.user.deleteMany(query);
					ids = data.map(({ id }) => id);
					break;
				}
			}
			return { ids };
		}),

	getList: adminProcedure
		.input(findManySchema)
		.query(async ({ input: { ids, pagination, resource, sort } }) => {
			const where = ids
				? {
						id: {
							in: ids,
						},
					}
				: undefined;
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
				case 'hunt': {
					const hunts = await db.hunt.findMany({
						...query,
						include: {
							hunters: {
								select: { id: true },
							},
						},
					});
					return {
						data: hunts.map(({ hunters, ...hunt }) => ({
							...hunt,
							hunterIds: extractIds(hunters),
						})),
						total: await db.hunt.count({ where }),
					};
				}
				case 'hunter': {
					const hunters = await db.hunter.findMany({
						...query,
						include: {
							hunts: {
								select: {
									id: true,
								},
							},
						},
					});
					return {
						data: hunters.map(({ hunts, ...hunter }) => ({
							...hunter,
							huntIds: extractIds(hunts),
						})),
						total: await db.hunter.count({ where }),
					};
				}
				case 'photo': {
					const photos = await db.photo.findMany(query);
					return {
						data: photos.map((photo) => ({
							...photo,
							url: photoUrl({
								height: photo.height,
								path: photo.path,
								width: photo.width,
							}),
						})),
						total: await db.photo.count({ where }),
					};
				}
				case 'user': {
					const users = await db.user.findMany({
						...query,
						include: {
							hunters: {
								orderBy: {
									alive: 'desc',
								},
								select: { id: true },
							},
						},
						omit: { password: true },
					});
					return {
						data: users.map(({ hunters, ...user }) => ({
							...user,
							hunterIds: extractIds(hunters),
						})),
						total: await db.user.count({ where }),
					};
				}
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
				case 'hunt': {
					const { hunters, ...hunt } = await db.hunt.findFirstOrThrow(
						{
							...query,
							include: {
								hunters: {
									select: { id: true },
								},
							},
						},
					);
					return {
						...hunt,
						// This is specifically for autocomplete input.
						hunterIds: hunters.map(({ id }) => id),
					};
				}
				case 'hunter': {
					const hunter = await db.hunter.findFirstOrThrow({
						...query,
						include: { avatar: true },
					});
					return {
						...hunter,
						avatar: hunter.avatar
							? outputPhoto({ photo: hunter.avatar })
							: null,
					};
				}
				case 'photo':
					return db.photo.findFirstOrThrow(query);
				case 'user': {
					const { hunters, ...user } = await db.user.findFirstOrThrow(
						{
							...query,
							include: {
								hunters: {
									orderBy: {
										alive: 'asc',
									},
									select: { id: true },
								},
							},
							omit: { password: true },
						},
					);
					return { hunterIds: extractIds(hunters), ...user };
				}
			}
		}),

	getReferences: adminProcedure
		.input(
			findManySchema
				.omit({ ids: true })
				.extend(
					z.object({ id: idSchemaCoerce, target: z.string() }).shape,
				),
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

	updateMany: adminProcedure
		.input(adminInput.and(z.object({ ids: z.array(idSchemaCoerce) })))
		.mutation(async ({ input: { data, ids, resource } }) => {
			const where = { id: { in: ids } };
			switch (resource) {
				case 'hunt':
					await db.hunt.updateMany({
						data,
						where,
					});
					break;
				case 'hunter':
					await db.hunter.updateMany({
						data,
						where,
					});
					break;
				case 'photo':
					await db.photo.updateMany({
						data,
						where,
					});
					break;
				case 'user':
					await db.user.updateMany({
						data,
						where,
					});
					break;
			}
			return { ids };
		}),

	updateOne: adminProcedure
		.input(adminInput.and(z.object({ id: idSchemaCoerce })))
		.mutation(async ({ input: { data, id, resource } }) => {
			switch (resource) {
				case 'hunt': {
					if (
						data.hunterIds &&
						data.maxHunters &&
						data.hunterIds.length > data.maxHunters
					) {
						throw new TRPCError({
							code: 'BAD_REQUEST',
							message: 'Cannot assign more hunters than maximum',
						});
					}
					const { hunters, ...result } = await db.hunt.update({
						data: {
							...omit(data, 'hunterIds'),
							hunters: {
								set: data.hunterIds?.map((id) => ({ id })),
							},
						},
						include: {
							hunters: {
								select: {
									id: true,
								},
							},
						},
						where: { id },
					});
					return {
						...result,
						hunterIds: extractIds(hunters),
					};
				}
				case 'hunter':
					return db.hunter.update({
						data,
						where: { id },
					});
				case 'photo':
					return db.photo.update({
						data,
						where: { id },
					});
				case 'user': {
					return db.user.update({
						data: {
							...omit(data, 'hunterIds'),
							hunters: {
								set: data.hunterIds?.map((id) => ({ id })),
							},
						},
						where: { id },
					});
				}
			}
		}),
});
