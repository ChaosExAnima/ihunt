import { readFile } from 'node:fs/promises';
import 'dotenv/config';
import { z } from 'zod';

const configSchema = z.object({
	adminPassword: z.string(),
	authPepper: z.string(),
	authSession: z.string(),
	mediaPath: z.string().min(2),
	mediaUrl: z.string().min(2),
	nodeEnv: z.enum(['development', 'production', 'test']),
	port: z.coerce.number().int().min(1).default(4000),
});

const configVars: Record<string, string | undefined> = {};

for (const key in process.env) {
	const camelCaseKey = key
		.replace(/^VITE_/, '')
		.replace(/__FILE$/, '')
		.toLowerCase()
		.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

	if (key.endsWith('__FILE') && process.env[key]) {
		const value = await readFile(process.env[key], 'utf-8');
		if (value.trim()) {
			configVars[camelCaseKey] = value.trim();
		}
	} else {
		configVars[camelCaseKey] = process.env[key];
	}
}
const _config = configSchema.safeParse(configVars);

if (!_config.success) {
	throw new Error(
		'❌ Invalid environment variables: ' +
			JSON.stringify(_config.error.flatten(), null, 4),
	);
}
export const config = _config.data;
