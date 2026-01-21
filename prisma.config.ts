import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const url = `file://${process.env.DB_PATH ?? './prisma/dev.db'}`;

export default defineConfig({
	datasource: {
		url,
	},
	migrations: {
		path: 'prisma/migrations',
		seed: 'tsx prisma/seed.ts',
	},
	schema: 'prisma/schema.prisma',
});
