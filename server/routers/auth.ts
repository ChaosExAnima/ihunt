import { TRPCError } from '@trpc/server';

import { omit } from '@/lib/utils';

import { publicProcedure, router, userProcedure } from '../trpc';

export const authRouter = router({
	logIn: publicProcedure.mutation(async ({ ctx: { session } }) => {
		try {
			// TODO: Actually implement login logic
			const userId = 'admin';
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

	me: userProcedure.query(({ ctx: { hunter, user } }) => {
		return {
			hunter: omit(hunter, 'userId'),
			settings: {
				hideMoney: user.hideMoney,
			},
		} as const;
	}),
});
