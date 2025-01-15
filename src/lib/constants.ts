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

export const huntSchema = z.object({
	comment: z.string().nullable(),
	completedAt: z.coerce.date().nullable().default(null),
	danger: z.number().int().min(1).max(3).default(1),
	description: z.string().default(''),
	maxHunters: z.number().int().min(1).max(4).default(1),
	name: z.string().min(1),
	rating: z.number().int().min(0).max(5).default(0),
	scheduledAt: z.coerce.date().nullable().default(null),
	status: huntStatus,
});
