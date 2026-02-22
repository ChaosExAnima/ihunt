import 'dotenv/config';
import { resolve } from 'node:path';
import { defineConfig } from 'prisma/config';

const path = resolve(process.cwd(), process.env.DB_PATH ?? './prisma/dev.db');

export default defineConfig({
	datasource: {
		url: `file://${path}`,
	},
	migrations: {
		path: 'prisma/migrations',
		seed: 'tsx prisma/seed.ts',
	},
	schema: 'prisma/schema.prisma',
});
