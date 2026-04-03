import { QueryClient } from '@tanstack/react-query';
import {
	createTRPCClient,
	httpBatchLink,
	httpLink,
	httpSubscriptionLink,
	isNonJsonSerializable,
	loggerLink,
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

const LAN_SERVER_KEY = 'ihunt-lan-server';

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

let timeout = 5 * SECOND;
async function testLanServer() {
	if (!lanServer || lanWorking) {
		return;
	}

	try {
		const response = await fetch(new URL('/trpc/api.hello', lanServer), {
			targetAddressSpace: 'local',
			credentials: 'include',
			signal: AbortSignal.timeout(5 * SECOND),
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

const url = '/trpc';
const trpcClient = createTRPCClient<AppRouter>({
	links: [
		loggerLink({
			enabled: () => !!localStorage.getItem('debugApi'),
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
				transformer: superjson,
				url() {
					return new URL(url, getHost()).toString();
				},
			}),
		}),
	],
});

let lanServer = localStorage.getItem(LAN_SERVER_KEY);
if (!lanServer) {
	void loadLanServer();
}
async function loadLanServer() {
	const response = await trpcClient.api.hello.query();
	if (response.lanHost) {
		lanServer = response.lanHost;
		localStorage.setItem(LAN_SERVER_KEY, response.lanHost);
		console.log('Set LAN server to:', lanServer);
	}
}
let lanWorking = true;

export function apiDebug() {
	return {
		lanWorking,
		lanServer,
	};
}

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
