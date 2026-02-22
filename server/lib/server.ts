import fastify, { FastifyServerOptions } from 'fastify';

import { isPlainObject } from '@/lib/utils';

import { Config, config } from './config';

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

export const server = fastify({
	logger: envToLogger[config.nodeEnv],
	routerOptions: {
		maxParamLength: 5000,
	},
});

export const logger = server.log;
