import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';

import { adminAuthSchema, authSchema } from '@/lib/schemas';

import { passwordToHash } from '../auth';
import { config } from '../config';
import { db } from '../db';
import {
	adminProcedure,
	photoProcedure,
	publicProcedure,
	router,
	userProcedure,
} from '../trpc';

export const authRouter = router({
	adminLogin: adminProcedure
		.input(adminAuthSchema)
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

	isAdmin: adminProcedure.query(() => true),

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

	me: photoProcedure.query(({ ctx: { hunter, user } }) => {
		return {
			hunter: hunter,
			settings: {
				hideMoney: user.hideMoney,
			},
		} as const;
	}),
});
