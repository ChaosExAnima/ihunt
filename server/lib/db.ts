import { PrismaPg } from '@prisma/adapter-pg';

import { isDev } from '@/lib/utils';

import { Prisma, PrismaClient } from '../../prisma/generated/client';
import { config } from './config';
import { logger } from './server';

export * from '../../prisma/generated/client';

const levels: Prisma.LogLevel[] = ['error', 'warn'];
if (isDev()) {
	levels.push('query');
}

const adapter = new PrismaPg({
	connectionString: config.databaseUrl,
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
