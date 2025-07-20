import { publicProcedure, router, userProcedure } from '../trpc';

export const authRouter = router({
	logIn: publicProcedure.query(async ({ ctx: { session } }) => {
		// TODO: Actually implement login logic
		session.userId = '1';
		await session.save();
		return {
			message: 'Logged in successfully',
			session,
			status: 'ok',
		};
	}),

	logOut: userProcedure.mutation(({ ctx: { session } }) => {
		session.destroy();
	}),
});
