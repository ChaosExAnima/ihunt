import { z } from 'zod';
import 'dotenv/config';

const configSchema = z.object({
	adminPassword: z.string(),
	authSecret: z.string(),
	discordId: z.string(),
	discordSecret: z.string(),
	emailFrom: z.string().optional(),
	emailServer: z.string().optional(),
	imageHost: z.string(),
	nodeEnv: z.enum(['development', 'production', 'test']),
	port: z.coerce.number().int().min(1).default(4000),
});

const configVars: Record<string, string | undefined> = {};

for (const key in process.env) {
	const camelCaseKey = key
		.replace('VITE_', '')
		.toLowerCase()
		.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
	configVars[camelCaseKey] = process.env[key];
}
const _config = configSchema.safeParse(configVars);

if (!_config.success) {
	throw new Error(
		'❌ Invalid environment variables: ' +
			JSON.stringify(_config.error.flatten(), null, 4),
	);
}
export const config = _config.data;
