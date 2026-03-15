import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { Header } from '@/components/header';
import { Loading } from '@/components/loading';
import { trpc } from '@/lib/api';

export const Route = createFileRoute('/_auth/notifications')({
	component: RouteComponent,
	loader({ context: { queryClient } }) {
		void queryClient.prefetchQuery(trpc.notify.list.queryOptions());
	},
});

function RouteComponent() {
	const { isLoading, data: notifications } = useQuery(
		trpc.notify.list.queryOptions(),
	);

	if (isLoading) {
		return <Loading />;
	}

	return (
		<>
			<Header>Notifications</Header>
		</>
	);
}
