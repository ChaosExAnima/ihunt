import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import {
	createTRPCOptionsProxy,
	DecorateMutationProcedure,
	ResolverDef,
	TRPCMutationOptions,
} from '@trpc/tanstack-react-query';
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

const trpcClient = createTRPCClient<AppRouter>({
	links: [httpBatchLink({ transformer: superjson, url: '/trpc' })],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});

export function trpcMutate<TDef extends ResolverDef>(
	proc: DecorateMutationProcedure<TDef>,
	variables?: TDef['input'],
	options?: Parameters<TRPCMutationOptions<TDef>>[0],
) {
	return proc.mutationOptions(options).mutationFn?.(variables);
}
