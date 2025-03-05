import type { Hunt, Photo } from '@prisma/client';

import { z } from 'zod';

import { HUNT_MAX_DANGER, HunterModel, HuntStatus } from './constants';

export const idSchema = z.number().int().positive().min(1);
export const idSchemaCoerce = z.preprocess(
	(arg) => (typeof arg === 'string' ? Number.parseInt(arg) : arg),
	idSchema,
);

export const huntStatus = z.nativeEnum(HuntStatus);

export const photoSchema = z.object({
	blurry: z.string().nullable(),
	height: z.number().int().positive(),
	hunterId: idSchema.nullable(),
	id: idSchema,
	path: z.string(),
	width: z.number().int().positive(),
}) satisfies Zod.ZodType<Omit<Photo, 'hunterId' | 'huntId'>>;
export type PhotoSchema = Zod.infer<typeof photoSchema>;

export const hunterSchema = z.object({
	avatar: photoSchema.nullable(),
	bio: z.string().nullable(),
	handle: z.string().nullable(),
	id: idSchema,
	money: z.coerce.number().int().min(0),
	name: z.string(),
	pronouns: z.string().nullable(),
	type: z.string().nullable(),
}) satisfies z.ZodType<
	{ avatar: null | PhotoSchema } & Omit<
		HunterModel,
		'avatar' | 'avatarId' | 'userId'
	>
>;
export type HunterSchema = Zod.infer<typeof hunterSchema>;

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
	place: z.string().nullable(),
	rating: z.number().min(0).max(5).nullable(),
	scheduledAt: z.coerce.date().nullable(),
	status: huntStatus,
	warnings: z.string().nullable(),
}) satisfies z.ZodType<
	{ hunters?: HunterSchema[]; photos?: PhotoSchema[] } & Omit<
		Hunt,
		'createdAt'
	>
>;
export type HuntSchema = Zod.infer<typeof huntSchema>;
export const huntsSchema = z.array(huntSchema);
