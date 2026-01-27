import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import { MINUTE, SECOND } from '@/lib/formats';
import { isDev } from '@/lib/utils';

import { Context } from './auth';
import { handleError } from './error';

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

const errorMiddleware = t.middleware(
	async ({
		ctx: {
			req: { log },
		},
		next,
	}) => {
		try {
			return await next();
		} catch (error) {
			log.error(error, 'TRPC error');
			if (error instanceof Error) {
				handleError({ err: error });
			}

			throw new TRPCError({
				cause: error,
				code: 'INTERNAL_SERVER_ERROR',
			});
		}
	},
);

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;

const baseProcedure = t.procedure.use(errorMiddleware);

export const publicProcedure = baseProcedure;

export const userProcedure = baseProcedure.use(async ({ ctx, next }) => {
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

export const adminProcedure = baseProcedure.use(async ({ ctx, next }) => {
	if (!ctx.admin) {
		throw new TRPCError({ code: 'UNAUTHORIZED' });
	}
	return next({
		ctx: {
			admin: ctx.admin,
		},
	});
});

export const loggedInProcedure = baseProcedure.use(async ({ ctx, next }) => {
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

export const debugProcedure = baseProcedure.use(async ({ ctx, next }) => {
	if (!isDev()) {
		throw new TRPCError({ code: 'FORBIDDEN' });
	}
	return next({ ctx });
});
