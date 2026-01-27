import fastifyStatic from '@fastify/static';
import fastifyVite from '@fastify/vite';
import {
	fastifyTRPCPlugin,
	FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify';
import fastify, { FastifyServerOptions } from 'fastify';
import { resolve } from 'node:path';

import { MINUTE } from '@/lib/formats';
import { isDev } from '@/lib/utils';

import { createAuthContext } from './lib/auth';
import { Config, config } from './lib/config';
import { onHuntInterval } from './lib/hunt';
import { onInviteInterval } from './lib/invite';
import { appRouter, type AppRouter } from './router';

const envToLogger = {
	development: {
		transport: {
			options: {
				ignore: 'pid,hostname',
				singleLine: true,
				translateTime: 'HH:MM:ss Z',
			},
			target: 'pino-pretty',
		},
	},
	production: true,
	test: false,
} as const as Record<Config['nodeEnv'], FastifyServerOptions['logger']>;

const server = fastify({
	logger: envToLogger[config.nodeEnv],
	routerOptions: {
		maxParamLength: 5000,
	},
});
export const logger = server.log;

async function startServer() {
	await server.register(fastifyTRPCPlugin, {
		prefix: '/trpc',
		trpcOptions: {
			createContext: createAuthContext,
			router: appRouter,
		} satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
	});

	server.get('/trpc/panel', async (_, res) => {
		if (!isDev()) {
			return res.status(404).callNotFound();
		}

		const { renderTrpcPanel } = await import('trpc-ui');
		return res.header('content-type', 'text/html').send(
			renderTrpcPanel(appRouter, {
				meta: {
					title: 'iHunt API Testing',
				},
				transformer: 'superjson',
				url: `/trpc`,
			}),
		);
	});

	const timerId = setInterval(() => {
		void onHuntInterval();
		void onInviteInterval();
	}, MINUTE);

	const root = resolve(import.meta.dirname, '..');
	await server.register(fastifyVite, {
		dev: isDev(),
		distDir: resolve(root, 'dist'),
		root,
		spa: true,
	});

	server.register(fastifyStatic, {
		prefix: '/public/',
		root: resolve(root, 'public'),
	});

	server.get('*', async (_req, reply) => {
		reply.html();
	});
	try {
		await server.vite.ready();
		await server.listen({ host: '0.0.0.0', port: config.port });
	} catch (err) {
		timerId.close();
		logger.error(err);
		process.exit(1);
	}
}

if (process.argv[1] === import.meta.filename) {
	void startServer();
}
