import { TRPCError } from '@trpc/server';
import * as z from 'zod';

import {
	adminCreateInput,
	adminFilter,
	adminInput,
	resourceSchema,
} from '@/admin/schemas';
import { idArray, idSchemaCoerce } from '@/lib/schemas';
import { Entity } from '@/lib/types';
import { extractIds, extractKey, idsToObjects, omit } from '@/lib/utils';
import { db } from '@/server/lib/db';
import { updateHunt } from '@/server/lib/hunt';
import { photoUrl } from '@/server/lib/photo';
import { adminProcedure, router } from '@/server/lib/trpc';

import { handleToHash } from '../lib/auth';

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
					const hunter = await db.hunter.findUnique({
						where: { id: data.hunterId },
					});
					return await db.user.create({
						data: {
							...data,
							password: await handleToHash(
								hunter?.handle ?? 'password',
							),
						},
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
				ids: idArray,
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
		.input(
			adminFilter.and(
				z.object({
					ids: idArray.optional(),
				}),
			),
		)
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
						const { q: queryString, ...filterWhere } = filter ?? {};
						const groups = await db.hunterGroup.findMany({
							...query,
							include: {
								hunters: { select: { id: true } },
							},
							where: {
								...where,
								...filterWhere,
								name: queryString
									? {
											contains: queryString,
										}
									: undefined,
							},
						});

						return {
							data: groups.map(({ hunters, ...group }) => ({
								...group,
								hunterIds: extractIds(hunters),
							})),
							total: await db.hunterGroup.count({
								where: { ...filter, ...where },
							}),
						};
					}
					case 'hunt': {
						const { q: queryString, ...filterWhere } = filter ?? {};
						const hunts = await db.hunt.findMany({
							...query,
							include: {
								huntHunters: {
									select: {
										hunterId: true,
									},
								},
								photos: {
									select: { id: true },
								},
							},
							where: {
								...where,
								...filterWhere,
								name: queryString
									? {
											contains: queryString,
										}
									: undefined,
							},
						});
						return {
							data: hunts.map(
								({ huntHunters, photos, ...hunt }) => ({
									...hunt,
									hunterIds: extractKey(
										huntHunters,
										'hunterId',
									),
									photoIds: extractIds(photos),
								}),
							),
							total: await db.hunt.count({
								where: { ...filter, ...where },
							}),
						};
					}
					case 'hunter': {
						const { q: queryString, ...filterWhere } = filter ?? {};
						const hunters = await db.hunter.findMany({
							...query,
							include: {
								huntHunters: {
									select: {
										huntId: true,
									},
								},
							},
							where: {
								...where,
								...filterWhere,
								OR: queryString
									? [
											{ name: { contains: queryString } },
											{
												handle: {
													contains: queryString,
												},
											},
										]
									: undefined,
							},
						});
						return {
							data: hunters.map(({ huntHunters, ...hunter }) => ({
								...hunter,
								huntIds: extractKey(huntHunters, 'huntId'),
							})),
							total: await db.hunter.count({
								where: { ...filter, ...where },
							}),
						};
					}
					case 'photo': {
						const photos = await db.photo.findMany({
							...query,
							where: {
								...where,
								...filter,
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
							data: users,
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
						await db.hunterGroup.findUniqueOrThrow({
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
					const { huntHunters, photos, ...hunt } =
						await db.hunt.findUniqueOrThrow({
							...query,
							include: {
								huntHunters: {
									select: { hunterId: true },
								},
								photos: { select: { id: true } },
							},
						});
					return {
						...hunt,
						hunterIds: extractKey(huntHunters, 'hunterId'),
						photoIds: extractIds(photos),
					};
				}
				case 'hunter': {
					const hunter = await db.hunter.findUniqueOrThrow(query);
					return hunter;
				}
				case 'photo':
					return db.photo.findUniqueOrThrow(query);
				case 'user': {
					return db.user.findUniqueOrThrow({
						...query,
						omit: { password: true },
					});
				}
			}
		}),

	getReferences: adminProcedure
		.input(
			adminFilter.and(
				z.object({
					id: idSchemaCoerce,
					target: z.string(),
				}),
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
		.input(adminInput.and(z.object({ ids: idArray })))
		.mutation(async ({ input: { data, ids, resource } }) => {
			const where = { id: { in: ids } };
			switch (resource) {
				case 'group':
					await db.hunterGroup.updateMany({
						data,
						where,
					});
					break;
				case 'hunt': {
					await db.hunt.updateMany({
						data,
						where,
					});
					const hunts = await db.hunt.findMany({
						include: {
							huntHunters: {
								include: {
									hunter: true,
								},
							},
						},
						where,
					});
					for (const hunt of hunts) {
						await updateHunt({
							hunt,
							hunters: hunt.huntHunters.flatMap(
								({ hunter }) => hunter,
							),
						});
					}

					break;
				}
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
					const { huntHunters, ...hunt } = await db.hunt.update({
						data: {
							...omit(data, 'hunterIds', 'photoIds'),
							photos: {
								set: idsToObjects(data.photoIds),
							},
							huntHunters: {
								connectOrCreate: (data.hunterIds ?? []).map(
									(hunterId) => ({
										create: {
											hunterId,
										},
										where: {
											huntId_hunterId: {
												hunterId,
												huntId: id,
											},
										},
									}),
								),
							},
						},
						where: { id },
						include: {
							huntHunters: {
								include: {
									hunter: true,
								},
							},
						},
					});
					const updates = await updateHunt({
						hunt,
						hunters: huntHunters.map(({ hunter }) => hunter),
					});
					return {
						...hunt,
						hunterIds: extractKey(huntHunters, 'hunterId'),
						updates,
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
						data,
						where: { id },
					});
				}
			}
		}),

	resetPassword: adminProcedure
		.input(z.object({ userId: idSchemaCoerce }))
		.mutation(async ({ input: { userId } }) => {
			const hunter = await db.hunter.findUnique({
				where: {
					userId,
				},
			});
			await db.user.update({
				where: {
					id: userId,
				},
				data: {
					password: await handleToHash(hunter?.handle ?? 'password'),
				},
			});
		}),
});
