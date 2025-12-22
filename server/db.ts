import { PrismaClient } from '@prisma/client';

/**
 * Instantiates a single instance PrismaClient and save it on the global object.
 * @see https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */
import { config } from './config';

export const db = new PrismaClient({
	log:
		config.nodeEnv === 'development'
			? ['query', 'error', 'warn']
			: ['error'],
});
