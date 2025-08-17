import { Photo } from '@prisma/client';
import { TRPCError } from '@trpc/server';

import { omit } from '@/lib/utils';

import { db } from '../db';
import { publicProcedure, router, userProcedure } from '../trpc';

export const authRouter = router({
	logIn: publicProcedure.mutation(async ({ ctx: { session } }) => {
		try {
			// TODO: Actually implement login logic
			const userId = 'cm6o4i77i00008m6tudr8ry8t';
			session.userId = userId;
			await session.save();
			return {
				success: true,
			};
		} catch (err) {
			throw new TRPCError({ cause: err, code: 'UNAUTHORIZED' });
		}
	}),

	logOut: userProcedure.mutation(({ ctx: { session } }) => {
		session.destroy();
	}),

	me: userProcedure.query(async ({ ctx: { hunter, user } }) => {
		let avatar: null | Omit<Photo, 'hunterId' | 'huntId' | 'id'> = null;
		if (hunter.avatarId) {
			const photo = await db.photo.findFirst({
				where: { id: hunter.avatarId },
			});
			if (photo) {
				avatar = omit(photo, 'id', 'huntId', 'hunterId');
			}
		}
		return {
			avatar,
			hunter: omit(hunter, 'userId', 'avatarId'),
			settings: {
				hideMoney: user.hideMoney,
			},
		} as const;
	}),
});
