import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
	datasource: {
		url: process.env.DATABASE_URL!,
	},
	migrations: {
		path: 'prisma/migrations',
		seed: 'tsx prisma/seed.ts',
	},
	schema: 'prisma/schema.prisma',
});
