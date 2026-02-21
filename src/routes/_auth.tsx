import { onlineManager, useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { Loading } from '@/components/loading';
import { Navbar } from '@/components/navbar';
import { PlayerInfoProvider } from '@/components/providers/player';
import { useNotifyRequestToast, useNotifySubscribe } from '@/hooks/use-notify';
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

	useNotifyRequestToast();
	useNotifySubscribe();

	if (!player) {
		return <Loading />;
	}

	return (
		<PlayerInfoProvider info={player}>
			<div className="flex w-full grow flex-col justify-stretch">
				<Navbar hunter={player.hunter} isHuntActive={false} />
				<main className="flex grow flex-col gap-2 px-4 pb-4">
					<Outlet />
				</main>
			</div>
		</PlayerInfoProvider>
	);
}
