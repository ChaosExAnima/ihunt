import z from 'zod';

import {
	hunterSchema,
	huntSchema,
	idSchemaCoerce,
	photoSchema,
	posIntSchema,
} from '@/lib/schemas';

export const resourceSchema = z.enum(['hunt', 'hunter', 'user', 'photo']);
export type Resources = z.infer<typeof resourceSchema>;

export const adminHuntSchema = huntSchema.omit({ hunters: true, photos: true });
export type AdminHuntSchema = z.infer<typeof adminHuntSchema>;

export const adminHunterSchema = hunterSchema
	.omit({
		avatar: true,
	})
	.extend(
		z.object({
			alive: z.boolean(),
			avatarId: idSchemaCoerce.nullish(),
			userId: idSchemaCoerce.nullish(),
		}).shape,
	);
export type AdminHunterSchema = z.infer<typeof adminHunterSchema>;

export const adminPhotoSchema = photoSchema.extend(
	z.object({
		height: posIntSchema,
		hunterId: idSchemaCoerce.nullish(),
		huntId: idSchemaCoerce.nullish(),
		id: idSchemaCoerce,
		width: posIntSchema,
	}).shape,
);
export type AdminPhotoSchema = z.infer<typeof adminPhotoSchema>;

export const adminUserSchema = z.object({
	hideMoney: z.boolean(),
	id: idSchemaCoerce,
	name: z.string().nullable(),
	run: posIntSchema.prefault(1),
});
export type AdminUserSchema = z.infer<typeof adminUserSchema>;

export const adminCreateInput = z.discriminatedUnion('resource', [
	z.object({
		data: adminHuntSchema.omit({ id: true }),
		resource: z.literal('hunt'),
	}),
	z.object({
		data: adminHunterSchema.omit({ id: true }),
		resource: z.literal('hunter'),
	}),
	z.object({
		data: adminPhotoSchema.omit({ id: true }),
		resource: z.literal('photo'),
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
		data: adminPhotoSchema.omit({ id: true }).partial(),
		resource: z.literal('photo'),
	}),
	z.object({
		data: adminUserSchema.omit({ id: true }).partial(),
		resource: z.literal('user'),
	}),
]);
