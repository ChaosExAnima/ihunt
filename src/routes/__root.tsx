import { QueryClient } from '@tanstack/react-query';
import {
	createRootRouteWithContext,
	ErrorComponent,
	Outlet,
} from '@tanstack/react-router';

import { cn, isDev } from '@/lib/utils';

const devMode = isDev();

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: () => (
		<div
			className={cn(
				'flex flex-col',
				devMode && 'border border-stone-400 dark:border-stone-800',
				devMode && 'w-full sm:w-[360px] min-h-[687px] mx-auto mt-4',
			)}
		>
			<Outlet />
		</div>
	),
	errorComponent: ErrorComponent,
});
