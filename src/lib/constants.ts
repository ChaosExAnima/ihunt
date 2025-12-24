import { Prisma } from '@prisma/client';

import type { HunterTypeSchema } from './schemas';

export const Locale = 'de-DE';
export const Currency = 'EUR';

export const PASSWORD_CHAR_COUNT = 6;
export const SESSION_COOKIE_NAME = 'ihunt-session';

export const HuntStatus = {
	Active: 'active',
	Available: 'available',
	Cancelled: 'cancelled',
	Complete: 'complete',
	Pending: 'pending',
} as const;
export type HuntStatusValues = (typeof HuntStatus)[keyof typeof HuntStatus];

export const HUNT_MAX_PER_DAY = 2;
export const HUNT_MAX_HUNTERS = 5;
export const HUNT_MAX_DANGER = 5;

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

export const HunterTypes = {
	Evileena: 'evileena',
	Knight: 'knight',
	Phooey: 'phooey',
	SixtySixer: '66er',
} as const satisfies Record<string, HunterTypeSchema>;
