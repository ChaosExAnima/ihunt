import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import DevTools from './components/dev-tools';
import { useOffline } from './hooks/use-offline';
import { useTheme } from './hooks/use-theme';
import { queryClient } from './lib/api';
import { isDev } from './lib/utils';

import '@fontsource-variable/geist-mono';
import '@fontsource/kanit';

import { routeTree } from './routeTree.gen';

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
	const devMode =
		isDev() &&
		(window.location.hostname.endsWith('.local') ||
			window.location.hostname === 'localhost');

	useTheme();
	useOffline();

	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			{devMode && <ReactQueryDevtools />}
			{devMode && <TanStackRouterDevtools router={router} />}
			{devMode && <DevTools />}
		</QueryClientProvider>
	);
}
