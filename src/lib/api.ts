import { QueryClient } from '@tanstack/react-query';
import {
	createTRPCClient,
	httpBatchLink,
	httpLink,
	isNonJsonSerializable,
	splitLink,
} from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import superjson from 'superjson';

import type { AppRouter } from '@/server/index';

import { toast } from '@/hooks/use-toast';

export const queryClient = new QueryClient({
	defaultOptions: {
		mutations: {
			onError(err) {
				toast({ description: err.message, title: 'Error' });
			},
		},
		queries: {
			// With SSR, we usually want to set some default staleTime
			// above 0 to avoid refetching immediately on the client
			staleTime: 60 * 1000,
		},
	},
});

const url = '/trpc';
const trpcClient = createTRPCClient<AppRouter>({
	links: [
		splitLink({
			condition: (op) => isNonJsonSerializable(op.input),
			false: httpBatchLink({
				transformer: superjson,
				url,
			}),
			true: httpLink({ transformer: superjson, url }),
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});

export const trpcPlain = trpcClient;
