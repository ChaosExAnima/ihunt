import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { PlayerSettingsProvider } from '@/components/providers/player';
import { trpc } from '@/lib/api';

export const Route = createFileRoute('/_auth')({
	async beforeLoad({ context: { queryClient }, location }) {
		try {
			const player = await queryClient.fetchQuery(
				trpc.auth.me.queryOptions(),
			);
			if (player) {
				return { player };
			}
		} catch {
			// Empty
		}
		throw redirect({ search: { redirect: location.href }, to: '/' });
	},
	component: () => {
		const { player } = Route.useRouteContext();
		return (
			<PlayerSettingsProvider settings={player}>
				<Outlet />
			</PlayerSettingsProvider>
		);
	},
});
