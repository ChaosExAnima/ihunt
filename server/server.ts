import {
	fastifyTRPCPlugin,
	type FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify';

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
