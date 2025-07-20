import { MutationCache, QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';

import { toast } from '@/hooks/use-toast';

import type { AppRouter } from '../../server';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// With SSR, we usually want to set some default staleTime
			// above 0 to avoid refetching immediately on the client
			staleTime: 60 * 1000,
		},
	},
	mutationCache: new MutationCache({
		onError(err) {
			toast({ description: err.message, title: 'Error' });
		},
	}),
});

const trpcClient = createTRPCClient<AppRouter>({
	links: [httpBatchLink({ url: '/trpc' })],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
