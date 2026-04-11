import { TRPCError } from '@trpc/server';
import * as z from 'zod';

import {
	adminCreateInput,
	adminFilter,
	adminInput,
	resourceSchema,
} from '@/admin/schemas';
import { HuntStatus } from '@/lib/constants';
import { idArray, idSchemaCoerce } from '@/lib/schemas';
import { Entity } from '@/lib/types';
import { extractIds, extractKey, idsToEntities, omit } from '@/lib/utils';
import { db } from '@/server/lib/db';
import { completeHunt, updateHunt } from '@/server/lib/hunt';
import { photoUrl } from '@/server/lib/photo';
import { adminProcedure, router } from '@/server/lib/trpc';

import { hunterUpdateNotifications } from '../lib/hunter';
import { InviteStatus } from '../lib/schema';

export const adminRouter = router({
	create: adminProcedure
		.input(adminCreateInput)
		.mutation(async ({ input: { data, resource } }) => {
			switch (resource) {
				case 'group': {
					const { hunters, ...group } = await db.hunterGroup.create({
						data: {
							hunters: {
								connect: idsToEntities(data.hunterIds),
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
					return await db.user.create({ data });
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
					await db.huntHunter.deleteMany({
						where: {
							huntId: {
								in: inIds,
							},
						},
					});
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
				input: { filter, ids, meta, perPage, page, resource, sort },
				ctx: { isLan },
			}) => {
				let filterWhere = filter ?? {};

				if (filter && 'q' in filter) {
					const textSearch = filter.q;
					// @ts-expect-error -- Query is broken
					delete filterWhere.q;
					filterWhere = {
						...filterWhere,
						...textSearch,
					};
				}

				const where = {
					id: ids ? { in: ids } : undefined,
					...filterWhere,
				};

				const query = {
					orderBy: sort
						? {
								[sort.field]: sort.order.toLowerCase(),
							}
						: undefined,
					skip: perPage && page ? perPage * (page - 1) : undefined,
					take: perPage,
					where,
				};

				switch (resource) {
					case 'group': {
						const groups = await db.hunterGroup.findMany({
							...query,
							include: {
								hunters: { select: { id: true } },
							},
						});

						return {
							data: groups.map(({ hunters, ...group }) => ({
								...group,
								hunterIds: extractIds(hunters),
							})),
							total: await db.hunterGroup.count({
								where,
							}),
						};
					}
					case 'hunt': {
						const hunts = await db.hunt.findMany({
							...query,
							include: {
								huntHunters: true,
								photos: {
									select: { id: true },
								},
							},
						});
						return {
							data: hunts.map(
								({ huntHunters, photos, ...hunt }) => ({
									...hunt,
									hunterIds: extractKey(
										huntHunters.filter(
											({ status }) =>
												status ===
												InviteStatus.Accepted,
										),
										'hunterId',
									),
									photoIds: extractIds(photos),
									reserved: huntHunters.some(
										({ status, expiresAt }) =>
											status === InviteStatus.Pending &&
											!!expiresAt,
									),
								}),
							),
							total: await db.hunt.count({
								where,
							}),
						};
					}
					case 'hunter': {
						const hunters = await db.hunter.findMany({
							...query,
							include: {
								huntHunters: {
									select: {
										huntId: true,
									},
									where: {
										status: InviteStatus.Accepted,
									},
								},
							},
						});
						return {
							data: hunters.map(({ huntHunters, ...hunter }) => ({
								...hunter,
								huntIds: extractKey(huntHunters, 'huntId'),
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
								url: photoUrl({ ...photo, isLan }),
							})),
							total: await db.photo.count({ where }),
						};
					}
					case 'user': {
						const users = await db.user.findMany({ ...query });
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
									where: { status: InviteStatus.Accepted },
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
					const { hunter, ...user } = await db.user.findUniqueOrThrow(
						{
							...query,
							include: { hunter: { select: { id: true } } },
						},
					);

					return {
						...user,
						hunterId: hunter?.id,
					};
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
			async ({
				input: { id, perPage, page, resource, sort, target },
			}) => {
				const where = {
					[target]: id,
				};
				const query = {
					orderBy: sort
						? {
								[sort.field]: sort.order.toLowerCase(),
							}
						: undefined,
					skip: perPage && page ? perPage * (page - 1) : undefined,
					take: perPage,
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
							data: await db.user.findMany(query),
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
						data: omit(data, 'createdAt', 'hunterIds'),
						where,
					});
					const hunts = await db.hunt.findMany({
						where,
					});
					for (const hunt of hunts) {
						await updateHunt({
							hunt,
							hunterIds: data.hunterIds,
						});
					}

					break;
				}
				case 'hunter': {
					const hunters = await db.hunter.findMany({
						where: {
							id: {
								in: ids,
							},
						},
					});
					for (const hunter of hunters) {
						await hunterUpdateNotifications(hunter, data);
					}

					if (data.alive === false) {
						data.user = undefined;
					}

					await db.hunter.updateMany({
						data,
						where,
					});
					break;
				}
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
						data,
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
					const { hunterIds, ...dataRest } = data;
					if (
						hunterIds &&
						data.maxHunters &&
						hunterIds.length > data.maxHunters
					) {
						throw new TRPCError({
							code: 'BAD_REQUEST',
							message: 'Cannot assign more hunters than maximum',
						});
					}
					const hunt = await db.hunt.update({
						data: dataRest,
						where: { id },
					});
					await updateHunt({
						hunt,
						hunterIds,
					});
					return {
						...hunt,
						hunterIds,
					};
				}
				case 'hunter': {
					const hunter = await db.hunter.findUniqueOrThrow({
						where: { id },
					});

					await hunterUpdateNotifications(hunter, data);

					// Dead hunters cannot be played.
					if (data.alive === false) {
						data.user = undefined;
					}

					return await db.hunter.update({
						data,
						where: { id },
					});
				}
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

	completeHunt: adminProcedure
		.input(
			z.object({
				huntId: idSchemaCoerce,
				payment: z.int().nonnegative(),
				comment: z.string().optional(),
				huntRating: z.number().nonnegative(),
			}),
		)
		.mutation(
			async ({
				input,
				ctx: {
					req: { log },
				},
			}) => {
				await completeHunt({
					...input,
					logger: log,
				});
			},
		),

	wallData: adminProcedure.query(async () => {
		const reviews = await db.huntHunter.findMany({
			// All hunts that are completed + have a comment, where the hunter was part of the hunt.
			where: {
				status: InviteStatus.Accepted,
				hunt: {
					status: HuntStatus.Complete,
					comment: {
						not: null,
					},
				},
			},
			include: {
				hunt: {
					include: {
						photos: true,
					},
				},
				hunter: {
					include: {
						avatar: true,
					},
				},
			},
		});

		type Review = (typeof reviews)[0];

		// Create a map and set of reviews based on string ID.
		const availableReviews = new Set<string>();
		const reviewMap = new Map<string, Review>();
		for (const review of reviews) {
			const id = `${review.huntId}:${review.hunterId}`;
			availableReviews.add(id);
			reviewMap.set(id, review);
		}

		// Have counts of hunts + hunters, and final sequence.
		const sequence: Review[] = [];
		const huntCounts = new Map<number, number>();
		const hunterCounts = new Map<number, number>();

		while (availableReviews.size > 0) {
			let bestCandidateId: string | null = null;
			let bestScore = Infinity;

			// Iterate over available reviews, summing the hunt + hunter frequency and using the lowest total score.
			for (const id of availableReviews) {
				const review = reviewMap.get(id);
				if (!review) {
					continue;
				}
				const score =
					(huntCounts.get(review.huntId) ?? 0) +
					(hunterCounts.get(review.hunterId) ?? 0);

				if (score < bestScore) {
					bestScore = score;
					bestCandidateId = id;
				}
			}

			// Set the review, and remove it from the available review list.
			const bestCandidate = bestCandidateId
				? reviewMap.get(bestCandidateId)
				: null;
			if (bestCandidate) {
				huntCounts.set(
					bestCandidate.huntId,
					(huntCounts.get(bestCandidate.huntId) ?? 0) + 1,
				);
				hunterCounts.set(
					bestCandidate.hunterId,
					(hunterCounts.get(bestCandidate.hunterId) ?? 0) + 1,
				);
				sequence.push(bestCandidate);
				availableReviews.delete(
					`${bestCandidate.huntId}:${bestCandidate.hunterId}`,
				);
			}
		}

		return sequence;
	}),
});
