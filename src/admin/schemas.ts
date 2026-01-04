import * as z from 'zod';

import {
	groupSchema,
	hunterSchema,
	huntSchema,
	idArray,
	idSchemaCoerce,
	photoSchema,
	posIntSchema,
} from '@/lib/schemas';

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
	});
export type AdminHuntSchema = z.infer<typeof adminHuntSchema>;

export const adminHunterSchema = hunterSchema
	.omit({
		avatar: true,
	})
	.extend({
		alive: z.boolean(),
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
	hideMoney: z.boolean(),
	hunterIds: idArray,
	id: idSchemaCoerce,
	name: z.string().nullable(),
	run: posIntSchema.prefault(1),
});
export type AdminUserSchema = z.infer<typeof adminUserSchema>;

export const adminCreateHuntInput = adminHuntSchema.omit({
	comment: true,
	completedAt: true,
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

export const adminInput = z.discriminatedUnion('resource', [
	z.object({
		data: adminHuntSchema.omit({ id: true }).partial(),
		resource: z.literal('hunt'),
	}),
	z.object({
		data: adminHunterSchema.omit({ id: true }).partial(),
		resource: z.literal('hunter'),
	}),
	z.object({
		data: adminGroupSchema.omit({ id: true }).partial(),
		resource: z.literal('group'),
	}),
	z.object({
		data: adminPhotoSchema.omit({ id: true }).partial(),
		resource: z.literal('photo'),
	}),
	z.object({
		data: adminUserSchema.omit({ id: true }).partial(),
		resource: z.literal('user'),
	}),
]);

export const adminFilter = z
	.discriminatedUnion('resource', [
		z.object({
			...schemaToFilter(adminHuntSchema),
			resource: z.literal('hunt'),
		}),
		z.object({
			...schemaToFilter(adminHunterSchema, []),
			resource: z.literal('hunter'),
		}),
		z.object({
			...schemaToFilter(adminGroupSchema, ['hunterIds', 'name']),
			resource: z.literal('group'),
		}),
		z.object({
			...schemaToFilter(adminPhotoSchema, ['url']),
			resource: z.literal('photo'),
		}),
		z.object({
			...schemaToFilter(adminUserSchema),
			resource: z.literal('user'),
		}),
	])
	.and(
		z.object({
			meta: z.record(z.string(), z.string().or(z.boolean())).optional(),
			pagination: z
				.object({
					page: posIntSchema,
					perPage: posIntSchema,
				})
				.optional(),
		}),
	);

function schemaToFilter<TShape extends z.ZodRawShape>(
	schema: z.ZodObject<TShape>,
	filterOmit: (keyof TShape)[] = [],
) {
	const filter = filterOmit.reduce(
		(obj, curr) => ({ ...obj, [curr]: true }),
		{},
	);
	return {
		filter: schema
			.omit({ id: true, ...filter })
			.extend({ q: z.string() })
			.partial()
			.optional(),
		sort: z
			.object({
				field: z.string(),
				order: z.enum(['ASC', 'DESC']),
			})
			.optional(),
	};
}
