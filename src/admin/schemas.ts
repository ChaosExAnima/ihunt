import z from 'zod';

import {
	groupSchema,
	hunterSchema,
	huntSchema,
	idSchemaCoerce,
	photoSchema,
	posIntSchema,
} from '@/lib/schemas';

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
		hunterIds: z.array(idSchemaCoerce),
		photoIds: z.array(idSchemaCoerce),
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
	hunterIds: z.array(idSchemaCoerce),
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
	hunterIds: z.array(idSchemaCoerce),
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

export const adminFilter = z.discriminatedUnion('resource', [
	z.object({
		...schemaToFilter(adminHuntSchema),
		resource: z.literal('hunt'),
	}),
	z.object({
		...schemaToFilter(
			adminHunterSchema,
			[],
			['avatarId', 'groupId', 'userId'],
		),
		resource: z.literal('hunter'),
	}),
	z.object({
		...schemaToFilter(
			adminGroupSchema,
			['hunterIds', 'name'],
			['hunterIds'],
		),
		resource: z.literal('group'),
	}),
	z.object({
		...schemaToFilter(adminPhotoSchema),
		resource: z.literal('photo'),
	}),
	z.object({
		...schemaToFilter(adminUserSchema),
		resource: z.literal('user'),
	}),
]);

function schemaToFilter<TShape extends z.ZodRawShape>(
	schema: z.ZodObject<TShape>,
	filterOmit: (keyof TShape)[] = [],
	sortOmit: (keyof TShape)[] = filterOmit,
) {
	const filter = filterOmit.reduce(
		(obj, curr) => ({ ...obj, [curr]: true }),
		{},
	);
	const sort = sortOmit.reduce((obj, curr) => ({ ...obj, [curr]: true }), {});
	return {
		filter: schema
			.omit({ id: true, ...filter })
			.extend({ q: z.string() })
			.partial()
			.optional(),
		sort: z
			.object({
				field: schema.omit(sort).keyof(),
				order: z.enum(['ASC', 'DESC']),
			})
			.optional(),
	};
}
