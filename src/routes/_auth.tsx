import { onlineManager, useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { Loading } from '@/components/loading';
import Navbar from '@/components/navbar';
import { PlayerSettingsProvider } from '@/components/providers/player';
import { useNotifyRequest } from '@/hooks/use-subscribe';
import { trpc } from '@/lib/api';

export const Route = createFileRoute('/_auth')({
	component: Page,
	async loader({ context: { queryClient }, location }) {
		try {
			if (onlineManager.isOnline()) {
				await queryClient.ensureQueryData(trpc.auth.me.queryOptions());
			}
			return queryClient.prefetchQuery(trpc.auth.me.queryOptions());
		} catch {
			// Empty
		}
		throw redirect({ search: { redirect: location.href }, to: '/' });
	},
});

function Page() {
	const { data: player } = useQuery(trpc.auth.me.queryOptions());

	useNotifyRequest();

	if (!player) {
		return <Loading />;
	}

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
}
