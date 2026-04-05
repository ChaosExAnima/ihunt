import * as z from 'zod';

import {
	groupSchema,
	hunterSchema,
	huntSchema,
	idArray,
	idSchema,
	idSchemaCoerce,
	photoSchema,
	posIntSchema,
} from '@/lib/schemas';
import { idsToEntities } from '@/lib/utils';

export const adminAuthSchema = z.object({ password: z.string().min(4) });

export const resourceSchema = z.enum([
	'hunt',
	'hunter',
	'group',
	'user',
	'photo',
]);
export type Resources = z.infer<typeof resourceSchema>;

export const adminHuntSchema = huntSchema
	.omit({ hunters: true, photos: true, reserved: true })
	.extend({
		hunterIds: idArray,
		photoIds: idArray,
		reserved: z.boolean().optional(),
	});
export type AdminHuntSchema = z.infer<typeof adminHuntSchema>;

export const adminHunterSchema = hunterSchema
	.omit({
		avatar: true,
	})
	.extend({
		alive: z.boolean().default(true),
		avatarId: idSchemaCoerce.nullish(),
		groupId: idSchemaCoerce.nullish(),
		userId: idSchemaCoerce.nullish(),
	});
export type AdminHunterSchema = z.infer<typeof adminHunterSchema>;

export const adminGroupSchema = groupSchema.omit({ hunters: true }).extend({
	hunterIds: idArray,
});
export type AdminGroupSchema = z.infer<typeof adminGroupSchema>;

export const adminPhotoSchema = photoSchema.extend(
	z.object({
		height: posIntSchema,
		hunterId: idSchemaCoerce.nullish(),
		huntId: idSchemaCoerce.nullish(),
		id: idSchemaCoerce,
		url: z.url(),
		width: posIntSchema,
	}).shape,
);
export type AdminPhotoSchema = z.infer<typeof adminPhotoSchema>;

export const adminUserSchema = z.object({
	hunterId: idSchemaCoerce.nullish(),
	id: idSchemaCoerce,
	code: z.string().lowercase(),
	run: posIntSchema.prefault(1),
});
export type AdminUserSchema = z.infer<typeof adminUserSchema>;

export const adminCreateHuntInput = adminHuntSchema.omit({
	comment: true,
	completedAt: true,
	createdAt: true,
	hunterIds: true,
	id: true,
	photoIds: true,
	rating: true,
});

export const adminCreateInput = z.discriminatedUnion('resource', [
	z.object({
		data: adminCreateHuntInput,
		resource: z.literal('hunt'),
	}),
	z.object({
		data: adminHunterSchema.omit({ id: true }),
		resource: z.literal('hunter'),
	}),
	z.object({
		data: adminGroupSchema.omit({ id: true }),
		resource: z.literal('group'),
	}),
	z.object({
		data: adminUserSchema.omit({ id: true }),
		resource: z.literal('user'),
	}),
]);

function connectId(id?: number | null) {
	if (id === null) {
		return {
			disconnect: true,
		};
	}
	if (!id) {
		return undefined;
	}
	return {
		connect: {
			id,
		},
	};
}

function setIds(ids?: number[]) {
	if (!ids) {
		return undefined;
	}
	return {
		set: idsToEntities(ids),
	};
}

export const adminInput = z.discriminatedUnion('resource', [
	z.object({
		resource: z.literal('hunt'),
		data: adminHuntSchema
			.omit({ id: true })
			.partial()
			.transform(({ photoIds, ...rest }) => ({
				...rest,
				photos: setIds(photoIds),
			})),
	}),
	z.object({
		resource: z.literal('hunter'),
		data: adminHunterSchema
			.omit({ id: true })
			.partial()
			.transform(({ avatarId, groupId, userId, ...rest }) => ({
				...rest,
				avatar: connectId(avatarId),
				group: connectId(groupId),
				user: connectId(userId),
			})),
	}),
	z.object({
		resource: z.literal('group'),
		data: adminGroupSchema
			.omit({ id: true })
			.partial()
			.transform(({ hunterIds, ...rest }) => ({
				...rest,
				hunters: setIds(hunterIds),
			})),
	}),
	z.object({
		resource: z.literal('photo'),
		data: adminPhotoSchema
			.omit({ id: true, blurry: true, url: true })
			.partial(),
	}),
	z.object({
		data: adminUserSchema
			.omit({ id: true })
			.partial()
			.transform(({ hunterId, ...rest }) => ({
				...rest,
				hunter: connectId(hunterId),
			})),
		resource: z.literal('user'),
	}),
]);

export const adminSort = z
	.object({
		field: z.string(),
		order: z.enum(['ASC', 'DESC']),
	})
	.optional();

const INSENSITIVE = { mode: 'insensitive' } as const;

export const adminFilter = z
	.discriminatedUnion('resource', [
		z.object({
			resource: z.literal('hunt'),
			filter: z
				.object({
					q: z.string().transform((q) => ({
						name: { contains: q, ...INSENSITIVE },
					})),
					status: z
						.string()
						.array()
						.transform((statuses) => ({ in: statuses })),
					danger: z.int().min(0).max(5),
					scheduledAt: z.coerce.date().transform((date) => ({
						gte: new Date(date.setHours(0, 0, 0)),
						lte: new Date(date.setHours(23, 59, 59)),
					})),
				})
				.partial()
				.optional(),
		}),
		z.object({
			resource: z.literal('hunter'),
			filter: z
				.object({
					q: z.string().transform((q) => ({
						OR: [
							{ name: { contains: q, ...INSENSITIVE } },
							{ handle: { contains: q, ...INSENSITIVE } },
						],
					})),
					alive: z.boolean(),
					groupId: z
						.int()
						.nonnegative()
						.transform((id) => (id === 0 ? null : id)),
				})
				.partial()
				.optional(),
		}),
		z.object({
			resource: z.literal('group'),
			filter: z
				.object({
					q: z.string().transform((q) => ({
						name: { contains: q, ...INSENSITIVE },
					})),
				})
				.partial()
				.optional(),
		}),
		z.object({
			resource: z.literal('photo'),
			filter: z
				.object({
					huntId: idSchema,
					hunterId: idSchema,
				})
				.partial()
				.optional(),
		}),
		z.object({
			filter: z
				.object({
					hunter: z
						.boolean()
						.transform((hasHunter) =>
							hasHunter ? { isNot: null } : { is: null },
						),
				})
				.partial()
				.optional(),
			resource: z.literal('user'),
		}),
	])
	.and(
		z.object({
			sort: adminSort,
			meta: z.record(z.string(), z.string().or(z.boolean())).optional(),
			pagination: z
				.object({
					page: posIntSchema,
					perPage: posIntSchema,
				})
				.optional(),
		}),
	);
