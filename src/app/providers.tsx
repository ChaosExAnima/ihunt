'use client';

import {
	MutationCache,
	onlineManager,
	QueryClient,
	type QueryClientConfig,
	QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { WifiOff } from 'lucide-react';
import { type PropsWithChildren, useMemo, useState } from 'react';

import { toast } from '@/hooks/use-toast';

const config: QueryClientConfig = {
	mutationCache: new MutationCache({
		onError(err) {
			toast({ description: err.message, title: 'Error' });
		},
	}),
};

export function Providers({ children }: PropsWithChildren) {
	const client = useMemo(() => new QueryClient(config), []);
	const [offlineToast, setToast] = useState<null | ReturnType<typeof toast>>(
		null,
	);
	onlineManager.subscribe((isOnline) => {
		if (!offlineToast && !isOnline) {
			setToast(
				toast({
					description: 'You are offline',
					duration: Infinity,
					icon: WifiOff,
					permanent: true,
					title: 'Offline',
					variant: 'destructive',
				}),
			);
		} else if (offlineToast && isOnline) {
			offlineToast.dismiss();
			setToast(null);
		}
	});
	return (
		<QueryClientProvider client={client}>
			{children}
			<ReactQueryDevtools />
		</QueryClientProvider>
	);
}
