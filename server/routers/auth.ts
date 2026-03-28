import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';
import * as z from 'zod';

import { adminAuthSchema } from '@/admin/schemas';
import { authSchema, hunterSchema, idSchemaCoerce } from '@/lib/schemas';
import { config } from '@/server/lib/config';
import { db } from '@/server/lib/db';
import {
	debugProcedure,
	publicProcedure,
	router,
	userProcedure,
} from '@/server/lib/trpc';

import { getAdminSession } from '../lib/auth';
import { userSettingsDatabaseSchema } from '../lib/schema';

export const authRouter = router({
	logIn: publicProcedure.input(authSchema).mutation(
		async ({
			ctx: {
				session,
				req: { log },
			},
			input,
		}) => {
			const valid = await bcrypt.compare(
				input.password,
				config.userPassword,
			);
			if (!valid) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Invalid password',
				});
			}

			const user = await db.user.findUnique({
				where: {
					code: input.code,
				},
			});
			if (!user) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Unknown access code',
				});
			}

			const hunter = await db.hunter.findUnique({
				where: {
					userId: user.id,
					alive: true,
				},
			});
			if (!hunter) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message:
						'Your account is deactivated. Please contact support.',
				});
			}

			session.userId = user.id;

			log.info('User %d logged in', user.id);

			await session.save();
			return { success: true };
		},
	),

	logOut: publicProcedure.mutation(({ ctx: { session } }) => {
		session.destroy();
	}),

	me: userProcedure
		.output(
			z.object({
				hunter: hunterSchema,
				settings: userSettingsDatabaseSchema,
			}),
		)
		.query(({ ctx: { hunter, user } }) => ({
			hunter,
			settings: user.settings,
		})),

	adminLogin: publicProcedure
		.input(adminAuthSchema)
		.mutation(async ({ ctx: { req, res }, input }) => {
			const valid = await bcrypt.compare(
				input.password,
				config.adminPassword,
			);
			if (!valid) {
				throw new TRPCError({ code: 'UNAUTHORIZED' });
			}
			const session = await getAdminSession({ req, res });
			session.admin = true;
			await session.save();
			return { success: true };
		}),

	adminLogout: publicProcedure.mutation(async ({ ctx: { req, res } }) => {
		const session = await getAdminSession({ req, res });
		session.destroy();
	}),

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
