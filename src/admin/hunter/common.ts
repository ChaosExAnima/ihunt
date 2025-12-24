import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { idSchema } from '@/lib/schemas';

export type HunterRow = Prisma.HunterGetPayload<{
	include: { avatar: true; hunts: true; user: true };
}>;

export const hunterSchema = z.object({
	avatarId: idSchema.nullable(),
	money: z.number().int().min(0).default(0),
	name: z.string().min(1),
	userId: idSchema.nullable(),
});
