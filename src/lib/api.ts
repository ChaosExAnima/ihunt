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

import { MINUTE } from './formats';
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

export const LAN_SERVER_KEY = 'ihunt-lan-server';

function getHost() {
	const { protocol, host: curHost } = window.location;
	return lanServer && lanWorking ? lanServer : `${protocol}//${curHost}`;
}

async function lanFetch(input: RequestInfo | URL | string, init?: RequestInit) {
	if (!lanWorking) {
		console.debug('LAN not working, sending to public server');
		return fetch(input, init);
	}
	const path = input instanceof Request ? input.url : input;
	const host = getHost();
	const url = new URL(path, host);
	try {
		const resp = fetch(url, {
			...init,
			...(input instanceof Request ? input : {}),
			...(lanWorking ? { targetAddressSpace: 'local' } : {}),
			credentials: 'include',
		});
		return resp;
	} catch {
		const resp = await fetch(input, init);
		if (resp.ok) {
			lanWorking = false;
			window.setTimeout(() => {
				void checkServer();
			}, MINUTE);
			console.log('LAN request failed, checking again soon');
		}
		return resp;
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
	void checkServer();
}
async function checkServer() {
	const response = await trpcClient.api.hello.query();
	if (response.lanHost) {
		lanServer = response.lanHost;
		localStorage.setItem(LAN_SERVER_KEY, response.lanHost);
		console.log('Set LAN server to:', lanServer);
	}
}
let lanWorking = true;

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
