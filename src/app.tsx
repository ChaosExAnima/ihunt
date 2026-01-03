import { onlineManager, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { WifiOff } from 'lucide-react';
import { useState } from 'react';

import DevTools from './components/dev-tools';
import { Toaster } from './components/ui/toaster';
import { useTheme } from './hooks/use-theme';
import { toast } from './hooks/use-toast';
import { queryClient } from './lib/api';
import { isDev } from './lib/utils';
import { routeTree } from './routeTree.gen';

import '@fontsource-variable/geist-mono';
import '@fontsource/kanit';

// Create a new router instance
const router = createRouter({
	context: {
		queryClient,
	},
	defaultPreload: 'intent',
	// Since we're using React Query, we don't want loader calls to ever be stale
	// This will ensure that the loader is always called when the route is preloaded or visited
	defaultPreloadStaleTime: 0,
	routeTree,
	scrollRestoration: true,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

export function App() {
	const devMode = isDev() && window.location.hostname.endsWith('.local');
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

	useTheme();

	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			{devMode && <ReactQueryDevtools />}
			{devMode && <TanStackRouterDevtools router={router} />}
			{devMode && <DevTools />}
			<Toaster />
		</QueryClientProvider>
	);
}
