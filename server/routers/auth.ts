import { TRPCError } from '@trpc/server';

import { hunterSchema } from '@/lib/schemas';

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
