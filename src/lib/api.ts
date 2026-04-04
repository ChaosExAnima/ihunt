import { QueryClient } from '@tanstack/react-query';
import {
	createTRPCClient,
	httpBatchLink,
	httpLink,
	httpSubscriptionLink,
	isNonJsonSerializable,
	loggerLink,
	retryLink,
	splitLink,
} from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import superjson from 'superjson';

import type { AppRouter } from '@/server/index';

import { toast } from '@/hooks/use-toast';

import { MINUTE, SECOND } from './formats';
import { isDev } from './utils';

export const queryClient = new QueryClient({
	defaultOptions: {
		mutations: {
			onError(err) {
				toast({ description: err.message, title: 'Error' });
			},
		},
	},
});

const url = '/trpc';
const trpcClient = createTRPCClient<AppRouter>({
	links: [
		loggerLink({
			enabled: () => !!localStorage.getItem('debugApi'),
		}),
		retryLink({
			retry(opts) {
				if (
					opts.error.data &&
					opts.error.data.code !== 'INTERNAL_SERVER_ERROR'
				) {
					return false;
				}
				if (opts.op.type !== 'query') {
					return false;
				}

				return opts.attempts <= 3;
			},
			retryDelayMs: (index) => Math.min(SECOND * 2 ** index, 30 * SECOND),
		}),
		splitLink({
			condition: (op) => op.type === 'subscription',
			false: splitLink({
				condition: (op) => isNonJsonSerializable(op.input) || isDev(),
				false: httpBatchLink({
					url,
					fetch: lanFetch,
					transformer: superjson,
				}),
				true: httpLink({
					url,
					fetch: lanFetch,
					transformer: superjson,
				}),
			}),
			true: httpSubscriptionLink({
				url,
				transformer: superjson,
			}),
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});

const LAN_SERVER_KEY = 'ihunt-lan-server';

let lanServer = localStorage.getItem(LAN_SERVER_KEY);
let lanWorking = false;
if (!lanServer) {
	void loadLanServer().then(() => testLanServer());
} else {
	void testLanServer();
}

async function loadLanServer() {
	const response = await trpcClient.api.hello.query();
	if (response.lanHost) {
		lanServer = response.lanHost;
		localStorage.setItem(LAN_SERVER_KEY, response.lanHost);
		console.log('Set LAN server to:', lanServer);
	}
}

let timeout = 5 * SECOND;
async function testLanServer() {
	if (!lanServer || lanWorking) {
		return;
	}

	try {
		const response = await fetch(new URL('/trpc/api.hello', lanServer), {
			targetAddressSpace: 'local',
			credentials: 'include',
			signal: AbortSignal.timeout(2 * SECOND),
		});
		if (!response.ok) {
			throw new Error();
		}
		console.debug('LAN test worked, enabling LAN');
		lanWorking = true;
	} catch {
		timeout = Math.min(timeout * 2, MINUTE);
		console.debug(
			'LAN test failed, trying in',
			timeout / SECOND,
			'seconds',
		);
		window.setTimeout(() => {
			void testLanServer();
		}, timeout);
	}
}

function getHost() {
	const { protocol, host: curHost } = window.location;
	return lanServer && lanWorking ? lanServer : `${protocol}//${curHost}`;
}

async function lanFetch(input: RequestInfo | URL | string, init?: RequestInit) {
	if (!lanWorking || isDev()) {
		return fetch(input, init);
	}
	const path = input instanceof Request ? input.url : input;
	const host = getHost();
	const url = new URL(path, host);
	try {
		const resp = await fetch(url, {
			...init,
			targetAddressSpace: 'local',
			credentials: 'include',
		});
		return resp;
	} catch {
		const resp = await fetch(input, init);
		if (resp.ok) {
			lanWorking = false;
			timeout = 5 * SECOND; // Reset timeout
			console.log(
				'LAN request failed, checking again in',
				timeout / SECOND,
				'seconds',
			);
			window.setTimeout(() => {
				void testLanServer();
			}, timeout);
		}
		return resp;
	}
}

export function apiDebug() {
	return {
		lanWorking,
		lanServer,
	};
}
