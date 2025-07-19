import { initTRPC, TRPCError } from '@trpc/server';

interface Context {
	user: null | true;
}

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

export const authedProcedure = t.procedure.use(async ({ctx, next}) => {
	if (!ctx.user) {
		throw new TRPCError({code:'UNAUTHORIZED'});
	}
	return next({
		ctx: {
			user: ctx.user,
		}
	});
});
