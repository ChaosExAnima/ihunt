import 'dotenv/config'; // make sure to install dotenv package
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'postgresql',
	out: './server/db',
	schema: './server/db/schema.ts',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	// Print all statements
	verbose: true,
	// Always ask for confirmation
	strict: true,
});
