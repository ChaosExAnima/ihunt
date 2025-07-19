import {
	MutationCache,
	onlineManager,
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { WifiOff } from 'lucide-react';
import { StrictMode, useState } from 'react';
import ReactDOM from 'react-dom/client';

import DevTools from '@/components/dev-tools';
import { toast } from '@/hooks/use-toast';
import { isDev } from '@/lib/utils';
import { routeTree } from './routeTree.gen';

import '@fontsource-variable/geist-mono';
import '@fontsource/kanit';

const queryClient = new QueryClient({
	mutationCache: new MutationCache({
		onError(err) {
			toast({ description: err.message, title: 'Error' });
		},
	}),
});

// Create a new router instance
const router = createRouter({
	routeTree,
	defaultPreload: 'intent',
	// Since we're using React Query, we don't want loader calls to ever be stale
	// This will ensure that the loader is always called when the route is preloaded or visited
	defaultPreloadStaleTime: 0,
	scrollRestoration: true,
	context: {
		queryClient,
	},
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

export function App() {
	const devMode = isDev();
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
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			<ReactQueryDevtools />
			<TanStackRouterDevtools />
			{devMode && <DevTools />}
		</QueryClientProvider>
	);
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
