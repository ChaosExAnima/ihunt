import { z } from 'zod';

const configSchema = z.object({
	adminPassword: z.string(),
	authSecret: z.string(),
	backblazeBucket: z.string(),
	backblazeId: z.string(),
	backblazeKey: z.string(),
	discordId: z.string(),
	discordSecret: z.string(),
	emailFrom: z.string().optional(),
	emailServer: z.string().optional(),
	imageHost: z.string(),
	nodeEnv: z.enum(['development', 'production', 'test']),
});

export default function config() {
	const configVars: Record<string, string | undefined> = {};

	for (const key in import.meta.env) {
		const camelCaseKey = key
			.replace('NEXT_PUBLIC_', '')
			.toLowerCase()
			.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
		configVars[camelCaseKey] = process.env[key];
	}

	try {
		return configSchema.parse(configVars);
	} catch (err) {
		if (err instanceof z.ZodError) {
			console.error('Missing config:\n', z.treeifyError(err));
		}
		throw err;
	}
}

export const publicConfig = configSchema
	.pick({
		currency: true,
		imageHost: true,
		locale: true,
	})
	.parse({
		imageHost: import.meta.env.VITE_IMAGE_HOST,
	});
