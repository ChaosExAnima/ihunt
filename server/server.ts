import {
	fastifyTRPCPlugin,
	FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify';
import { resolve } from 'node:path';

import { MINUTE } from '@/lib/formats';
import { isDev } from '@/lib/utils';

import { createAuthContext } from './lib/auth';
import { config } from './lib/config';
import { onHuntInterval } from './lib/hunt';
import { onInviteInterval } from './lib/invite';
import { server } from './lib/server';
import { appRouter, type AppRouter } from './router';

async function startServer() {
	const origins = config.serverHosts.map((host) => new URL(host).hostname);
	server.addHook('onRequest', (req, reply, done) => {
		let reqOrigin = req.headers.origin ?? req.host;
		if (reqOrigin.startsWith('http')) {
			reqOrigin = reqOrigin.replace(/^https?:\/\//, '');
		}
		if (origins.includes(reqOrigin)) {
			reply.header('access-control-allow-origin', `https://${reqOrigin}`);
		}
		reply.header('access-control-allow-credentials', 'true');

		done();
	});

	// Register TRPC
	await server.register(fastifyTRPCPlugin, {
		prefix: '/trpc',
		trpcOptions: {
			createContext: createAuthContext,
			onError({ error: { code, cause }, path, req }) {
				req.log.error(cause, `${code} at ${path}: `);
			},
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

	// Main loop
	const timerId = setInterval(() => {
		void onHuntInterval();
		void onInviteInterval();
	}, MINUTE);

	try {
		await startDevMode();
		await server.listen({ host: '0.0.0.0', port: config.port });
	} catch (err) {
		timerId.close();
		server.log.error(err);
		process.exit(1);
	}
}

async function startDevMode() {
	if (!isDev()) {
		return;
	}

	const fastifyStatic = await import('@fastify/static');
	const fastifyVite = await import('@fastify/vite');

	// Register Vite
	const root = resolve(import.meta.dirname, config.clientConfigDir ?? '..');
	await server.register(fastifyVite, {
		dev: isDev(),
		distDir: resolve(root, 'dist'),
		root,
		spa: true,
	});

	// Static assets
	server.register(fastifyStatic, {
		prefix: '/public/',
		root: resolve(root, 'public'),
	});

	// Render
	server.get('*', (_req, reply) => {
		reply.html();
	});

	await server.vite.ready();
}

if (process.argv[1] === import.meta.filename) {
	void startServer();
}
