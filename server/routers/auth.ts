import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import * as z from 'zod';

import { adminAuthSchema } from '@/admin/schemas';
import { authSchema, hunterSchema, idSchemaCoerce } from '@/lib/schemas';
import { passwordToHash } from '@/server/lib/auth';
import { config } from '@/server/lib/config';
import { db } from '@/server/lib/db';
import {
	debugProcedure,
	publicProcedure,
	router,
	userProcedure,
} from '@/server/lib/trpc';

export const authRouter = router({
	adminLogin: publicProcedure
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

	logIn: publicProcedure
		.input(authSchema)
		.mutation(
			async ({
				ctx: { session },
				input: { password: plainPassword },
			}) => {
				try {
					const password = await passwordToHash(plainPassword);
					const user = await db.user.findUniqueOrThrow({
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

	logOut: publicProcedure.mutation(({ ctx: { session } }) => {
		session.destroy();
	}),

	me: userProcedure
		.output(
			z.object({
				hunter: hunterSchema,
				settings: z.object({
					hideMoney: z.boolean(),
				}),
			}),
		)
		.query(({ ctx: { hunter, user } }) => ({
			hunter,
			settings: {
				hideMoney: user.settings.hideMoney,
			},
		})),

	switch: debugProcedure
		.input(z.object({ hunterId: idSchemaCoerce }))
		.mutation(async ({ ctx: { session }, input: { hunterId } }) => {
			try {
				const hunter = await db.hunter.findUniqueOrThrow({
					where: { id: hunterId },
				});
				if (!hunter.alive || !hunter.userId) {
					throw new Error('Hunter is not available to switch to');
				}

				session.userId = hunter.userId;
				await session.save();
				return { success: true };
			} catch (err) {
				throw new TRPCError({ cause: err, code: 'UNAUTHORIZED' });
			}
		}),
});
