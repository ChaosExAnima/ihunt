import { PrismaPg } from '@prisma/adapter-pg';

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
const adapter = new PrismaPg({
	connectionString: `postgresql://${postgresUser}:${postgresPassword}@${postgresHost}/${postgresDatabase}`,
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
