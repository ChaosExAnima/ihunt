import { Hunt, Photo, Prisma } from '@prisma/client';
import { z } from 'zod';

import { idSchema } from './api';
import { publicConfig } from './config';

const { currency, locale } = publicConfig;

export const Locale = locale;
export const currencyFormatter = new Intl.NumberFormat(Locale, {
	currency: currency,
	maximumFractionDigits: 0,
	style: 'currency',
});

export const HuntStatus = {
	Active: 'active',
	Available: 'available',
	Cancelled: 'cancelled',
	Complete: 'complete',
	Pending: 'pending',
} as const;
export type HuntStatusValues = (typeof HuntStatus)[keyof typeof HuntStatus];

export const huntMaxPerDay = 2;
export const huntStatus = z.nativeEnum(HuntStatus);

export const huntDisplayInclude = {
	hunters: {
		include: {
			avatar: true,
		},
	},
	photos: true,
} as const satisfies Prisma.HuntInclude;

export type HunterModel = Prisma.HunterGetPayload<{
	include: { avatar: true };
}>;

export const photoSchema: Zod.ZodType<Omit<Photo, 'hunterId' | 'huntId'>> =
	z.object({
		blurry: z.string().nullable(),
		height: z.number().int().positive(),
		id: idSchema,
		path: z.string(),
		width: z.number().int().positive(),
	});
export type PhotoSchema = Zod.infer<typeof photoSchema>;

export const hunterSchema: z.ZodType<
	{ avatar: null | PhotoSchema } & Omit<
		HunterModel,
		'avatar' | 'avatarId' | 'userId'
	>
> = z.object({
	avatar: photoSchema.nullable(),
	bio: z.string().nullable(),
	handle: z.string().nullable(),
	id: idSchema,
	money: z.coerce.number().int().min(0),
	name: z.string(),
	pronouns: z.string().nullable(),
	type: z.string().nullable(),
});
export type HunterSchema = Zod.infer<typeof hunterSchema>;

export const huntSchema: z.ZodType<
	{ hunters?: HunterSchema[]; photos?: PhotoSchema[] } & Omit<
		Hunt,
		'createdAt'
	>
> = z.object({
	comment: z.string().nullable(),
	completedAt: z.coerce.date().nullable(),
	danger: z.number().int().min(1).max(3),
	description: z.string(),
	hunters: z.array(hunterSchema).default([]),
	id: idSchema,
	maxHunters: z.number().int().min(1).max(4),
	name: z.string().min(1),
	payment: z.number().int().min(0),
	photos: z.array(photoSchema).default([]),
	place: z.string().nullable(),
	rating: z.number().int().min(0).max(5).nullable(),
	scheduledAt: z.coerce.date().nullable(),
	status: huntStatus,
	warnings: z.string().nullable(),
});
export type HuntSchema = Zod.infer<typeof huntSchema>;
