import { Prisma } from '@prisma/client';
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
export const huntStatus = z.nativeEnum(HuntStatus).default(HuntStatus.Pending);

export type HuntModel = Prisma.HuntGetPayload<{
	include: typeof huntDisplayInclude;
}>;

export const huntDisplayInclude = {
	hunters: {
		include: {
			avatar: true,
		},
	},
	photos: true,
} as const satisfies Prisma.HuntInclude;

export const huntSchema = z.object({
	comment: z.string().nullable(),
	completedAt: z.coerce.date().nullable().default(null),
	danger: z.number().int().min(1).max(3).default(1),
	description: z.string().default(''),
	hunters: z.array(z.object({ id: idSchema })).default([]),
	maxHunters: z.number().int().min(1).max(4).default(1),
	name: z.string().min(1),
	payment: z.number().int().min(0).default(0),
	place: z.string().optional(),
	rating: z.number().int().min(0).max(5).default(0),
	scheduledAt: z.coerce.date().nullable().default(null),
	status: huntStatus,
});
export type HuntSchema = Zod.infer<typeof huntSchema>;
