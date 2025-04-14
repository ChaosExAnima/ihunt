import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { idSchema } from '@/lib/schemas';

export type UserRow = Prisma.UserGetPayload<{
	include: { hunter: { include: { avatar: true } } };
}>;

export const userSchema = z.object({
	email: z.string().email(),
	hunter: z.object({ id: idSchema.nullable() }),
	name: z.string(),
});

export type UserInput = z.infer<typeof userSchema>;
