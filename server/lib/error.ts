import { TRPC_ERROR_CODE_KEY, TRPCError } from '@trpc/server';
import z, { ZodError } from 'zod';

import { logger } from '../server';
import { Prisma } from './db';

interface HandleErrorArgs {
	code?: TRPC_ERROR_CODE_KEY;
	err: unknown;
	message?: string;
	notFoundMsg?: string;
	throws?: boolean;
}

export function handleError({
	code = 'INTERNAL_SERVER_ERROR',
	err,
	message = 'Unknown error',
	notFoundMsg = 'Not found',
	throws = true,
}: HandleErrorArgs) {
	if (err instanceof TRPCError && throws) {
		throw err;
	}

	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === 'P2001' || err.code === 'P2025') {
			code = 'NOT_FOUND';
			message = notFoundMsg;
		}
	} else if (err instanceof ZodError) {
		code = 'BAD_REQUEST';
		message = z.treeifyError(err).errors.join(', ');
	}

	logger.error(err, 'TRPC error');

	if (throws) {
		throw new TRPCError({
			cause: err,
			code,
			message,
		});
	}
}
