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
				'flex min-h-screen flex-col',
				devMode &&
					'border-border mx-auto w-full sm:mt-4 sm:min-h-172 sm:w-90 sm:border',
			)}
		>
			<Outlet />
			<Toaster />
		</div>
	),
	errorComponent: ErrorComponent,
});
