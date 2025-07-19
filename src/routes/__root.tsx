import { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

export const Route = createRootRouteWithContext<{
	auth: undefined;
	queryClient: QueryClient;
}>()({
	component: () => (
		<div className="flex flex-col">
			<Outlet />
		</div>
	),
});
