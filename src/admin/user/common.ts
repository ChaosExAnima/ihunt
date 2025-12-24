import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { idSchemaCoerce, posIntSchema } from '@/lib/schemas';

export type UserRow = Prisma.UserGetPayload<{
	include: { hunters: { include: { avatar: true } } };
	omit: { password: true };
}>;

export const userSchema = z.object({
	id: idSchemaCoerce,
	name: z.string().nullable(),
	run: posIntSchema.default(1),
});

export type UserInput = z.infer<typeof userSchema>;
