import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import Navbar from '@/components/navbar';
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
		const { player: initialData } = Route.useRouteContext();
		const { data: player } = useQuery({
			...trpc.auth.me.queryOptions(),
			initialData,
		});
		return (
			<PlayerSettingsProvider settings={player}>
				<div className="grow flex flex-col w-full justify-stretch">
					<Navbar hunter={player.hunter} isHuntActive={false} />
					<main className="grow px-4 flex flex-col gap-2 pb-4">
						<Outlet />
					</main>
				</div>
			</PlayerSettingsProvider>
		);
	},
});
