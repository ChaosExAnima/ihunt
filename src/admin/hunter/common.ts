import { Prisma } from '@prisma/client';
import { z } from 'zod';

export type HunterRow = Prisma.HunterGetPayload<{
	include: { avatar: true; hunts: true; user: true };
}>;

export const hunterSchema = z.object({
	money: z.number().int().min(0).default(0),
	name: z.string().min(1),
	user: z.object({ id: z.number().int() }),
});
