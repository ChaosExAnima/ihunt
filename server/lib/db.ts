import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

import { isDev } from '@/lib/utils';

import { Prisma, PrismaClient } from '../../prisma/generated/client';
/**
 * Instantiates a single instance PrismaClient and save it on the global object.
 * @see https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */
import { config } from './config';

export * from '../../prisma/generated/client';

const log: Prisma.LogLevel[] = ['error'];
if (isDev()) {
	log.push('warn');
	if (config.logging.includes('db')) {
		log.push('query');
	}
}

const adapter = new PrismaBetterSqlite3({
	url: `file://${process.env.DB_PATH ?? './prisma/dev.db'}`,
});
export const db = new PrismaClient({
	adapter,
	log,
});
