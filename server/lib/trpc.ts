import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import { MINUTE, SECOND } from '@/lib/formats';
import { isDev } from '@/lib/utils';

import { Context } from './auth';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
	sse: {
		client: {
			reconnectAfterInactivityMs: 5 * SECOND,
		},
		maxDurationMs: 5 * MINUTE,
		ping: {
			enabled: true,
			intervalMs: 3 * SECOND,
		},
	},
	transformer: superjson,
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

export const userProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!ctx.user) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	if (!ctx.hunter) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'User has no hunter',
		});
	}
	return next({
		ctx: {
			hunter: ctx.hunter,
			user: ctx.user,
		},
	});
});

export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!ctx.admin) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	return next({
		ctx: {
			admin: ctx.admin,
		},
	});
});

export const loggedInProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!ctx.admin && !ctx.user && !ctx.hunter) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	return next({
		ctx: {
			admin: ctx.admin,
			hunter: ctx.hunter,
			user: ctx.user,
		},
	});
});

export const debugProcedure = t.procedure.use(async ({ ctx, next }) => {
	if (!isDev()) {
		throw new TRPCError({ code: 'FORBIDDEN' });
	}
	return next({ ctx });
});
