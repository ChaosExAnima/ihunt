import { SECOND } from '@ihunt/lib/formats';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { Navbar } from '@/components/navbar';
import { useNotifyRequestToast, useNotifySubscribe } from '@/hooks/use-notify';
import { trpc } from '@/lib/api';

export const Route = createFileRoute('/_auth')({
	component: Page,
	async beforeLoad({ context: { queryClient }, location }) {
		try {
			const player = await queryClient.query({
				...trpc.auth.me.queryOptions(),
				staleTime: 'static',
			});
			return {
				...player,
			};
		} catch {
			throw redirect({ search: { redirect: location.href }, to: '/' });
		}
	},
});

function Page() {
	const { data: unreadCount = 0 } = useQuery({
		...trpc.notify.unreadCount.queryOptions(),
		refetchInterval: 30 * SECOND,
	});

	useNotifyRequestToast();
	useNotifySubscribe();

	return (
		<div className="flex w-full grow flex-col justify-stretch">
			<Navbar unreadCount={unreadCount} />
			<main className="flex grow flex-col gap-2 px-4 pb-4">
				<Outlet />
			</main>
		</div>
	);
}
