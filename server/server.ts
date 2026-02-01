import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import fastifyVite from '@fastify/vite';
import ciao from '@homebridge/ciao';
import {
	fastifyTRPCPlugin,
	FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify';
import fastify, { FastifyServerOptions } from 'fastify';
import { resolve } from 'node:path';

import { MINUTE } from '@/lib/formats';
import { isDev, isPlainObject } from '@/lib/utils';

import { createAuthContext } from './lib/auth';
import { Config, config } from './lib/config';
import { onHuntInterval } from './lib/hunt';
import { onInviteInterval } from './lib/invite';
import { appRouter, type AppRouter } from './router';

async function mDnsAdvertise() {
	const responder = ciao.getResponder();
	const service = responder.createService({
		name: config.mdnsName,
		port: config.port,
		txt: {
			test: 'value',
		},
		type: 'http',
	});

	console.log('mdns advertising on', config.mdnsName);
	await service.advertise();
}

const envToLogger = {
	development: {
		serializers: {
			req(request) {
				const [path, params] = request.url.split('?', 2);

				const response: Record<string, unknown> = {
					method: request.method,
					path,
				};

				if (isPlainObject(request.params) && !('*' in request.params)) {
					response.parameters = request.params;
				}

				if (params) {
					const queryParams = Object.fromEntries(
						new URLSearchParams(`?${params}`).entries(),
					);

					if ('input' in queryParams) {
						queryParams.input = JSON.parse(queryParams.input);
					}
					response.queryParams = queryParams;
				}

				if (path.startsWith('/trpc')) {
					response.path = '/trpc';
				}

				if (path.startsWith('/@fs')) {
					response.path = path.replace(process.cwd(), '');
				}

				return response;
			},
		},
		transport: {
			options: {
				ignore: 'pid,hostname,reqId,req.method,req.path',
				messageFormat:
					'{msg} | {if reqId}id={reqId}{endif}{if req.path} {req.method} {req.path}{endif}',
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
	server.register(fastifyCors, {
		origin: config.serverHosts,
	});

	// Register TRPC
	await server.register(fastifyTRPCPlugin, {
		prefix: '/trpc',
		trpcOptions: {
			createContext: createAuthContext,
			onError({ error: { code, ...error }, path, req }) {
				req.log.error(error, `${code} at ${path}`);
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

	// Register Vite
	const root = resolve(import.meta.dirname, '..');
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
	server.get('*', async (_req, reply) => {
		reply.html();
	});

	// Main loop
	const timerId = setInterval(() => {
		void onHuntInterval();
		void onInviteInterval();
	}, MINUTE);

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
	void mDnsAdvertise();
}
