import fastifyVite from '@fastify/vite';
import {
	fastifyTRPCPlugin,
	FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify';
import fastify from 'fastify';
import { resolve } from 'path';

import { isDev } from '@/lib/utils';
import { createAuthContext } from '@/server/lib/auth';
import { config } from '@/server/lib/config';

import { appRouter, type AppRouter } from './router';

async function startServer() {
	const server = fastify({
		logger: {
			transport: {
				target: '@fastify/one-line-logger',
			},
		},
		maxParamLength: 5000,
	});

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

	await server.register(fastifyVite, {
		dev: isDev(),
		root: resolve(import.meta.dirname, '..'),
		spa: true,
	});

	server.get('*', async (_req, reply) => {
		reply.html();
	});
	try {
		await server.vite.ready();
		await server.listen({ port: config.port });
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}

if (process.argv[1] === import.meta.filename) {
	void startServer();
}
