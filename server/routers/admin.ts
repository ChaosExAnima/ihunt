import { TRPCError } from '@trpc/server';
import z from 'zod';

import { adminCreateInput, adminInput, resourceSchema } from '@/admin/schemas';
import { idSchemaCoerce, posIntSchema } from '@/lib/schemas';
import { Entity } from '@/lib/types';
import { extractIds, idsToObjects, omit } from '@/lib/utils';

import { db } from '../db';
import { photoUrl } from '../photo';
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
	filter: z
		.object({
			noGroup: z.boolean().optional(),
			q: z.string().optional(),
		})
		.optional(),
	ids: z.array(idSchemaCoerce).optional(),
	meta: z.record(z.string(), z.string().or(z.boolean())).optional(),
	pagination: paginationSchema.optional(),
	resource: resourceSchema,
	sort: sortSchema.optional(),
});

export const adminRouter = router({
	create: adminProcedure
		.input(adminCreateInput)
		.mutation(async ({ input: { data, resource } }) => {
			switch (resource) {
				case 'group': {
					const { hunters, ...group } = await db.hunterGroup.create({
						data: {
							hunters: {
								connect: idsToObjects(data.hunterIds),
							},
							name: data.name,
						},
						include: {
							hunters: { select: { id: true } },
						},
					});
					return {
						...group,
						hunterIds: extractIds(hunters),
					};
				}
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
				case 'group':
					return db.hunterGroup.delete(query);
				case 'hunt':
					return db.hunt.delete(query);
				case 'hunter':
					return db.hunter.delete(query);
				case 'photo':
					return db.photo.update({
						...query,
						data: {
							hunterId: null,
							huntId: null,
						},
					});
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
			let data: Entity[] = [];
			switch (resource) {
				case 'group': {
					data = await db.hunterGroup.findMany(query);
					await db.hunterGroup.deleteMany(query);
					break;
				}
				case 'hunt': {
					data = await db.hunt.findMany(query);
					await db.hunt.deleteMany(query);
					break;
				}
				case 'hunter': {
					data = await db.hunter.findMany(query);
					await db.hunter.deleteMany(query);
					break;
				}
				case 'photo': {
					data = await db.photo.findMany(query);
					await db.photo.updateMany({
						...query,
						data: {
							hunterId: null,
							huntId: null,
						},
					});
					break;
				}
				case 'user': {
					data = await db.user.findMany(query);
					await db.user.deleteMany(query);
					break;
				}
			}

			return extractIds(data);
		}),

	getList: adminProcedure
		.input(findManySchema)
		.query(
			async ({
				input: { filter, ids, meta, pagination, resource, sort },
			}) => {
				const where = ids
					? {
							id: {
								in: ids,
							},
						}
					: {};
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
					case 'group': {
						const groups = await db.hunterGroup.findMany({
							...query,
							include: {
								hunters: { select: { id: true } },
							},
							where: {
								...where,
								name: filter?.q
									? {
											contains: filter.q,
										}
									: undefined,
							},
						});

						return {
							data: groups.map(({ hunters, ...group }) => ({
								...group,
								hunterIds: extractIds(hunters),
							})),
							total: await db.hunterGroup.count(query),
						};
					}
					case 'hunt': {
						const hunts = await db.hunt.findMany({
							...query,
							include: {
								hunters: {
									select: { id: true },
								},
								photos: {
									select: { id: true },
								},
							},
							where: {
								...where,
								name: filter?.q
									? {
											contains: filter.q,
										}
									: undefined,
							},
						});
						return {
							data: hunts.map(({ hunters, photos, ...hunt }) => ({
								...hunt,
								hunterIds: extractIds(hunters),
								photoIds: extractIds(photos),
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
							where: {
								...where,
								groupId: filter?.noGroup ? null : undefined,
								OR: filter?.q
									? [
											{ name: { contains: filter.q } },
											{ handle: { contains: filter.q } },
										]
									: undefined,
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
						const photos = await db.photo.findMany({
							...query,
							where: {
								...where,
								OR: !meta?.showAll
									? [
											{
												hunterId: {
													not: null,
												},
											},
											{ huntId: { not: null } },
										]
									: undefined,
							},
						});
						return {
							data: photos.map((photo) => ({
								...photo,
								url: photoUrl(photo),
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
							where: {
								...where,
								name: filter?.q
									? {
											contains: filter.q,
										}
									: undefined,
							},
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
			},
		),

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
				case 'group': {
					const { hunters, ...group } =
						await db.hunterGroup.findFirstOrThrow({
							...query,
							include: {
								hunters: {
									select: { id: true },
								},
							},
						});
					return {
						...group,
						hunterIds: extractIds(hunters),
					};
				}
				case 'hunt': {
					const { hunters, photos, ...hunt } =
						await db.hunt.findFirstOrThrow({
							...query,
							include: {
								hunters: {
									select: { id: true },
								},
								photos: { select: { id: true } },
							},
						});
					return {
						...hunt,
						hunterIds: extractIds(hunters),
						photoIds: extractIds(photos),
					};
				}
				case 'hunter': {
					const hunter = await db.hunter.findFirstOrThrow(query);
					return hunter;
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
				.extend({ id: idSchemaCoerce, target: z.string() }),
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
					case 'group':
						return {
							data: await db.hunterGroup.findMany(query),
							total: await db.hunterGroup.count({ where }),
						};
					case 'hunt':
						return {
							data: await db.hunt.findMany(query),
							total: await db.hunt.count({ where }),
						};
					case 'hunter':
						return {
							data: await db.hunter.findMany(query),
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
				case 'group':
					await db.hunterGroup.updateMany({
						data,
						where,
					});
					break;
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
				case 'group': {
					const { hunters, ...group } = await db.hunterGroup.update({
						data: {
							hunters: {
								set: idsToObjects(data.hunterIds),
							},
							name: data.name,
						},
						include: {
							hunters: { select: { id: true } },
						},
						where: { id },
					});
					return {
						...group,
						hunterIds: extractIds(hunters),
					};
				}
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
								set: idsToObjects(data.hunterIds),
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
								set: idsToObjects(data.hunterIds),
							},
						},
						where: { id },
					});
				}
			}
		}),
});
