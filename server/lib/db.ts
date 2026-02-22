import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { resolve } from 'node:path';

import { isDev } from '@/lib/utils';

import { Prisma, PrismaClient } from '../../prisma/generated/client';
import { logger } from '../server';

export * from '../../prisma/generated/client';

const levels: Prisma.LogLevel[] = ['error', 'warn'];
if (isDev()) {
	levels.push('query');
}

const path = resolve(process.cwd(), process.env.DB_PATH ?? './prisma/dev.db');
const adapter = new PrismaBetterSqlite3({
	url: `file://${path}`,
});
export const db = new PrismaClient({
	adapter,
	log: levels.map((level) => ({ emit: 'event', level })),
});

for (const level of levels) {
	if (level === 'query') {
		db.$on('query', (event) => {
			logger.debug(event, `db query: ${event.target}`);
		});
		continue;
	}
	db.$on(level, (event) => {
		logger[level](event, `db ${level}: ${event.target}`);
	});
}
