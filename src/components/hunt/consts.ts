import type { Prisma } from '@prisma/client';

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
