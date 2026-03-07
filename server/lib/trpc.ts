import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import z, { ZodError } from 'zod';

import { MINUTE, SECOND } from '@/lib/formats';
import { isDev } from '@/lib/utils';

import { Context } from './auth';
import { Prisma } from './db';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
	errorFormatter(opts) {
		const { error, shape } = opts;
		const data = shape.data;
		const cause = error.cause;
		if (cause instanceof ZodError) {
			data.code = 'BAD_REQUEST';
			shape.message = z.treeifyError(cause).errors.join(', ');
		} else if (cause instanceof Prisma.PrismaClientKnownRequestError) {
			if (cause.code === 'P2001' || cause.code === 'P2025') {
				data.code = 'NOT_FOUND';
				shape.message = 'Not found';
			} else {
				shape.message = 'Internal error';
			}
		}
		return {
			...shape,
			data,
		};
	},
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

const baseProcedure = t.procedure;

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
		throw new TRPCError({ code: 'NOT_FOUND' });
	}
	return next({ ctx });
});
