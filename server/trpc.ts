import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import { photoDimensionSchema } from '@/lib/schemas';

import { Context } from './auth';
import { recursivelyReplacePhotos } from './photo';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
	transformer: superjson,
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

export const userProcedure = t.procedure
	.input(photoDimensionSchema.optional())
	.output((output) => {
		return output;
	})
	.use(async ({ ctx, next }) => {
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

export const photoProcedure = userProcedure
	.input(photoDimensionSchema.optional())
	.use(async ({ next }) => {
		const output = await next();

		return recursivelyReplacePhotos(output) as typeof output;
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
