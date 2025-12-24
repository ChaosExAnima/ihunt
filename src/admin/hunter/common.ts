import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { HunterTypes } from '@/lib/constants';
import { idSchema } from '@/lib/schemas';

export type HunterRow = Prisma.HunterGetPayload<{
	include: { avatar: true; hunts: true; user: true };
}>;

export const hunterSchema = z.object({
	avatarId: idSchema.nullable(),
	money: z.int().min(0).prefault(0),
	name: z.string().min(1),
	userId: idSchema.nullable(),
});
export const hunterTypeChoices = Object.entries(HunterTypes).map(
	([key, val]) => ({
		id: val,
		name: key,
	}),
);
