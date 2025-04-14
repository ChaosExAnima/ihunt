'use client';

import {
	MutationCache,
	onlineManager,
	QueryClient,
	QueryClientConfig,
	QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { WifiOff } from 'lucide-react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ComponentProps, useMemo, useState } from 'react';

import { toast } from '@/hooks/use-toast';

const config: QueryClientConfig = {
	mutationCache: new MutationCache({
		onError(err) {
			toast({ description: err.message, title: 'Error' });
		},
	}),
};

export function Providers({
	children,
	...props
}: ComponentProps<typeof NextThemesProvider>) {
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
		<NextThemesProvider {...props}>
			<QueryClientProvider client={client}>
				{children}
				<ReactQueryDevtools />
			</QueryClientProvider>
		</NextThemesProvider>
	);
}
