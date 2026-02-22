import { QueryClient } from '@tanstack/react-query';
import {
	createRootRouteWithContext,
	ErrorComponent,
	Outlet,
} from '@tanstack/react-router';

import { Toaster } from '@/components/providers/toaster';
import { cn } from '@/lib/styles';
import { isDev } from '@/lib/utils';

const devMode = isDev();

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: () => (
		<div
			className={cn(
				'flex flex-col',
				devMode && 'border-border sm:border',
				devMode && 'mx-auto min-h-172 w-full sm:mt-4 sm:w-90',
			)}
		>
			<Outlet />
			<Toaster />
		</div>
	),
	errorComponent: ErrorComponent,
});
