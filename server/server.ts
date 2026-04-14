import { fastifyCors } from '@fastify/cors';
import {
	fastifyTRPCPlugin,
	type FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify';
import { setInterval } from 'node:timers/promises';

import { MINUTE, SECOND } from '@/lib/formats';
import { isDev } from '@/lib/utils';

import { createAuthContext } from './lib/auth';
import { config } from './lib/config';
import { onHuntInterval } from './lib/hunt';
import { onInviteInterval } from './lib/invite';
import { server } from './lib/server';
import { appRouter, type AppRouter } from './router';

async function startServer() {
	await server.register(fastifyCors, {
		credentials: true,
		origin: (origin?: string) =>
			Promise.resolve(
				origin && origin === config.lanHost
					? config.lanHost
					: config.publicHost,
			),
	});

	// Register TRPC
	await server.register(fastifyTRPCPlugin, {
		prefix: '/trpc',
		trpcOptions: {
			createContext: createAuthContext,
			onError({ error: { code, cause, stack }, path, req }) {
				req.log.error(cause, `${code} at ${path}: ${stack}`);
			},
			router: appRouter,
		} satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
	});

	// Main loop
	if (!config.heartbeatDisabled) {
		void startMainLoop();
	}

	try {
		await startDevMode();
		await server.listen({ host: '0.0.0.0', port: config.port });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}

async function startMainLoop() {
	for await (const startTime of setInterval(
		isDev() ? SECOND * 10 : MINUTE,
		Date.now(),
	)) {
		await onHuntInterval(server.log);
		await onInviteInterval(server.log);
		server.log.info(`Finished loop in ${Date.now() - startTime}ms`);
	}
}

async function startDevMode() {
	if (!isDev()) {
		return;
	}

	const { renderTrpcPanel } = await import('trpc-ui');

	server.get('/trpc/panel', async (_, res) =>
		res.header('content-type', 'text/html').send(
			renderTrpcPanel(appRouter, {
				meta: {
					title: 'iHunt API Testing',
				},
				transformer: 'superjson',
				url: '/trpc',
			}),
		),
	);
}

if (process.argv[1] === import.meta.filename) {
	void startServer();
}
