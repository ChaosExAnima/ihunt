import { defineConfig } from 'prisma/config';

import { config } from './server/lib/config';

const { postgresDatabase, postgresHost, postgresPassword, postgresUser } =
	config;
export default defineConfig({
	datasource: {
		url: `postgresql://${postgresUser}:${postgresPassword}@${postgresHost}:5432/${postgresDatabase}`,
	},
	migrations: {
		path: 'prisma/migrations',
		seed: 'tsx prisma/seed.ts',
	},
	schema: 'prisma/schema.prisma',
});
