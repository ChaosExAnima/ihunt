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

export const idSchema = z.number().int().positive().min(1);
export const idSchemaCoerce = z.preprocess(
	(arg) => (typeof arg === 'string' ? Number.parseInt(arg) : arg),
	idSchema,
);

export const huntStatus = z.nativeEnum(HuntStatus);

export const photoDimensionSchema = z.object({
	height: z.number().int().positive().optional(),
	width: z.number().int().positive().optional(),
});

export const photoSchema = z.object({
	blurry: z.string().nullable(),
	height: z.number().int().positive(),
	id: idSchema,
	url: z.string().url(),
	width: z.number().int().positive(),
});
export type PhotoSchema = z.infer<typeof photoSchema>;

export const hunterSchema = z.object({
	avatar: photoSchema.nullable(),
	bio: z.string().nullable(),
	handle: z.string(),
	id: idSchema,
	money: z.coerce.number().int().min(0),
	name: z.string(),
	pronouns: z.string().nullable(),
	type: z.string().nullable(),
});
export type HunterSchema = z.infer<typeof hunterSchema>;

export const huntSchema = z.object({
	comment: z.string().nullable(),
	completedAt: z.coerce.date().nullable(),
	danger: z.number().int().min(1).max(HUNT_MAX_DANGER),
	description: z.string(),
	hunters: z.array(hunterSchema),
	id: idSchema,
	maxHunters: z.number().int().min(1).max(4),
	name: z.string().min(1),
	payment: z.number().int().min(0),
	photos: z.array(photoSchema),
	place: z.string().nullish(),
	rating: z.coerce.number().min(0).max(5),
	scheduledAt: z.coerce.date().nullable(),
	status: huntStatus,
	warnings: z.string().nullish(),
});
export type HuntSchema = z.infer<typeof huntSchema>;
export const huntsSchema = z.array(huntSchema);
