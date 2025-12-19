import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import z from 'zod';

import { authSchema, hunterSchema } from '@/lib/schemas';

import { passwordToHash } from '../auth';
import { config } from '../config';
import { db } from '../db';
import {
	adminProcedure,
	publicProcedure,
	router,
	userProcedure,
} from '../trpc';

export const authRouter = router({
	adminLogin: adminProcedure
		.input(z.object({ password: z.string().min(4) }))
		.mutation(async ({ ctx: { session }, input }) => {
			const valid = await bcrypt.compare(
				input.password,
				config.adminPassword,
			);
			if (!valid) {
				throw new TRPCError({ code: 'UNAUTHORIZED' });
			}
			session.isAdmin = true;
			await session.save();
			return { success: true };
		}),

	logIn: publicProcedure
		.input(authSchema)
		.mutation(
			async ({
				ctx: { session },
				input: { password: plainPassword },
			}) => {
				try {
					const password = await passwordToHash(plainPassword);
					const user = await db.user.findFirstOrThrow({
						where: { password },
					});
					session.userId = user.id;
					await session.save();
					return { success: true };
				} catch (err) {
					throw new TRPCError({ cause: err, code: 'UNAUTHORIZED' });
				}
			},
		),

	logOut: userProcedure.mutation(({ ctx: { session } }) => {
		session.destroy();
	}),

	me: userProcedure.query(
		({ ctx: { hunter, user } }) =>
			({
				hunter: hunterSchema.parse(hunter),
				settings: {
					hideMoney: user.hideMoney,
				},
			}) as const,
	),
});
