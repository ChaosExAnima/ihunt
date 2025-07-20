import fastifyVite from '@fastify/vite';
import {
	fastifyTRPCPlugin,
	FastifyTRPCPluginOptions,
} from '@trpc/server/adapters/fastify';
import fastify from 'fastify';
import { resolve } from 'path';

import { isDev } from '@/lib/utils';

import { createAuthContext } from './auth';
import { appRouter, type AppRouter } from './router';

const server = fastify({
	maxParamLength: 5000,
});

server.register(fastifyTRPCPlugin, {
	prefix: '/trpc',
	trpcOptions: {
		createContext: createAuthContext,
		onError({ error, path }) {
			// report to error monitoring
			console.error(`Error in tRPC handler on path '${path}':`, error);
		},
		router: appRouter,
	} satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
});

server.register(fastifyVite, {
	dev: isDev(),
	root: resolve(import.meta.dirname, '../..'),
	spa: true,
});

server.get('*', async (_req, reply) => {
	reply.html();
});

async function startServer() {
	try {
		await server.vite.ready();
		await server.listen({ port: 3000 });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
}
void startServer();
