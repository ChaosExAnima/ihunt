import { z } from 'zod';

import { HUNT_MAX_DANGER, HuntStatus, PASSWORD_CHAR_COUNT } from './constants';

export const authSchema = z.object({
	password: z
		.string()
		.toLowerCase()
		.regex(/[a-z0-9]+/, 'Code must be only numbers or letters')
		.length(PASSWORD_CHAR_COUNT, 'Code must be exactly six characters'),
});

export const adminAuthSchema = z.object({ password: z.string().min(4) });

export const posIntSchema = z.int().positive();

export const idSchema = posIntSchema.min(1);
export const idSchemaCoerce = z.preprocess(
	(arg) => (typeof arg === 'string' ? Number.parseInt(arg) : arg),
	idSchema,
);

export const huntStatus = z.enum(HuntStatus);

export const photoSchema = z.object({
	blurry: z.string().nullable(),
	id: idSchema,
});
export type PhotoSchema = z.infer<typeof photoSchema>;

export const photoHuntSchema = photoSchema.extend(
	z.object({
		hunterId: idSchema.nullable(),
	}).shape,
);
export type PhotoHuntSchema = z.infer<typeof photoHuntSchema>;

export const hunterTypeSchema = z.enum([
	'evileena',
	'knight',
	'phooey',
	'66er',
]);
export type HunterTypeSchema = z.infer<typeof hunterTypeSchema>;

export const hunterSchema = z.object({
	avatar: photoSchema.nullable(),
	bio: z.string().nullable(),
	handle: z.string().min(6),
	id: idSchema,
	money: z.coerce.number().int(),
	name: z.string(),
	pronouns: z.string().nullable(),
	rating: z.number().positive().max(5),
	type: z
		.string()
		.transform((type) => hunterTypeSchema.parse(type))
		.nullable(),
});
export type HunterSchema = z.infer<typeof hunterSchema>;

export const huntReservedSchema = z.object({
	expires: z.coerce.date(),
	status: z.enum(['invited', 'reserved', 'sent']),
});
export type HuntReservedSchema = z.infer<typeof huntReservedSchema>;
export type HuntReservedStatusSchema = HuntReservedSchema['status'];

export const huntSchema = z.object({
	comment: z.string().nullable(),
	completedAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
	danger: z.int().min(1).max(HUNT_MAX_DANGER),
	description: z.string(),
	hunters: z.array(hunterSchema),
	id: idSchema,
	maxHunters: z.int().min(1).max(4),
	name: z.string().min(1),
	payment: posIntSchema,
	photos: z.array(photoHuntSchema),
	place: z.string().nullish(),
	rating: z.coerce.number().min(0).max(5),
	reserved: huntReservedSchema.nullish(),
	scheduledAt: z.coerce.date().nullable(),
	status: huntStatus,
	warnings: z.string().nullish(),
});
export type HuntSchema = z.infer<typeof huntSchema>;
export const huntsSchema = z.array(huntSchema);

export const groupSchema = z.object({
	hunters: z.array(hunterSchema),
	id: idSchema,
	name: z.string(),
});
export type GroupSchema = z.infer<typeof groupSchema>;
