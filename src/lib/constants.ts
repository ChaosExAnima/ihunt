import { Prisma } from '@prisma/client';

import { publicConfig } from './config';

const { currency, locale } = publicConfig;

export const Locale = locale;
export const Currency = currency;

export const HuntStatus = {
	Active: 'active',
	Available: 'available',
	Cancelled: 'cancelled',
	Complete: 'complete',
	Pending: 'pending',
} as const;
export type HuntStatusValues = (typeof HuntStatus)[keyof typeof HuntStatus];

export const huntMaxPerDay = 2;

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
