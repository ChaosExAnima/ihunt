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
import { toast } from 'sonner';
import superjson from 'superjson';

import type { AppRouter } from '@/server/index';

export const queryClient = new QueryClient({
	defaultOptions: {
		mutations: {
			onError(err) {
				toast.error('Error', { description: err.message });
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
		splitLink({
			condition: (op) => op.type === 'subscription',
			false: splitLink({
				condition: (op) => isNonJsonSerializable(op.input),
				false: httpBatchLink({
					transformer: superjson,
					url,
				}),
				true: httpLink({ transformer: superjson, url }),
			}),
			true: httpSubscriptionLink({
				transformer: superjson,
				url,
			}),
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
