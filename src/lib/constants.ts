import { Prisma } from '@prisma/client';
import { z } from 'zod';

export enum HuntStatus {
	Active = 'active',
	Available = 'available',
	Cancelled = 'cancelled',
	Complete = 'complete',
	Pending = 'pending',
}

export const huntStatusNames: Record<HuntStatus, string> = {
	[HuntStatus.Active]: 'Active',
	[HuntStatus.Available]: 'Available',
	[HuntStatus.Cancelled]: 'Cancelled',
	[HuntStatus.Complete]: 'Complete',
	[HuntStatus.Pending]: 'Pending',
};

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
