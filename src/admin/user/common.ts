import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { idSchema } from '@/lib/schemas';

export type UserRow = Prisma.UserGetPayload<{
	include: { hunters: { include: { avatar: true } } };
	omit: { password: true };
}>;

export const userSchema = z.object({
	hunter: z.object({ id: idSchema.nullable() }),
	name: z.string(),
});

export type UserInput = z.infer<typeof userSchema>;
