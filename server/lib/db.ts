import { PrismaPostgresAdapter } from '@prisma/adapter-ppg';

import { isDev } from '@/lib/utils';

import { Prisma, PrismaClient } from '../../prisma/generated/client';
import { logger } from '../server';
import { config } from './config';

export * from '../../prisma/generated/client';

const levels: Prisma.LogLevel[] = ['error', 'warn'];
if (isDev()) {
	levels.push('query');
}

const { postgresDatabase, postgresHost, postgresPassword, postgresUser } =
	config;
const adapter = new PrismaPostgresAdapter({
	connectionString: `postgresql://${postgresUser}:${postgresPassword}@${postgresHost}:5432/${postgresDatabase}`,
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
