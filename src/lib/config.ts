import { z } from 'zod';

const configSchema = z.object({
	adminPassword: z.string(),
	authSecret: z.string(),
	backblazeBucket: z.string(),
	backblazeId: z.string(),
	backblazeKey: z.string(),
	currency: z.string().default('EUR'),
	discordId: z.string(),
	discordSecret: z.string(),
	emailFrom: z.string().optional(),
	emailServer: z.string().optional(),
	imageHost: z.string(),
	locale: z.string().default('de-DE'),
	nodeEnv: z.enum(['development', 'production', 'test']),
});

export default function config() {
	const configVars: Record<string, string | undefined> = {};

	for (const key in process.env) {
		const camelCaseKey = key
			.replace('NEXT_PUBLIC_', '')
			.toLowerCase()
			.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
		configVars[camelCaseKey] = process.env[key];
	}

	try {
		return configSchema.parse(configVars);
	} catch (err) {
		if (err instanceof z.ZodError) {
			console.error(
				`Missing config:\n${err.errors.map((e) => e.path[0]).join('\n')}`,
			);
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
		currency: process.env.NEXT_PUBLIC_CURRENCY,
		imageHost: process.env.NEXT_PUBLIC_IMAGE_HOST,
		locale: process.env.NEXT_PUBLIC_LOCALE,
	});
