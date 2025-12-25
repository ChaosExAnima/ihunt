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
	.omit({ hunters: true, photos: true })
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

export const adminCreateInput = z.discriminatedUnion('resource', [
	z.object({
		data: adminHuntSchema.omit({
			comment: true,
			completedAt: true,
			hunterIds: true,
			id: true,
			rating: true,
		}),
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
