import { QueryClient } from '@tanstack/react-query';
import {
	createRootRouteWithContext,
	ErrorComponent,
	Outlet,
} from '@tanstack/react-router';

import { Toaster } from '@/components/ui/sonner';
import { cn, isDev } from '@/lib/utils';

const devMode = isDev();

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: () => (
		<div
			className={cn(
				'flex flex-col',
				devMode && 'sm:border border-border',
				devMode && 'w-full sm:w-90 min-h-172 mx-auto sm:mt-4',
			)}
		>
			<Outlet />
			<Toaster closeButton visibleToasts={2} />
		</div>
	),
	errorComponent: ErrorComponent,
});
