import { Prisma, PrismaClient } from '@prisma/client';

import { isDev } from '@/lib/utils';

/**
 * Instantiates a single instance PrismaClient and save it on the global object.
 * @see https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */
import { config } from './config';

const log: Prisma.LogLevel[] = ['error'];
if (isDev()) {
	log.push('warn');
	if (config.logging.includes('db')) {
		log.push('query');
	}
}

export const db = new PrismaClient({
	log,
});
