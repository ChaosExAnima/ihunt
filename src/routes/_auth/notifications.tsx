import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

import { Header } from '@/components/header';
import { Loading } from '@/components/loading';
import { Notification } from '@/components/notification';
import { useInvalidate } from '@/hooks/use-invalidate';
import { trpc } from '@/lib/api';
import { cn } from '@/lib/styles';

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

	const invalidate = useInvalidate();
	const { mutate } = useMutation(
		trpc.notify.read.mutationOptions({
			onSuccess() {
				invalidate(trpc.notify.unreadCount.queryKey());
			},
		}),
	);

	useEffect(() => {
		return () => {
			mutate();
		};
	}, [mutate]);

	if (isLoading) {
		return <Loading />;
	}

	return (
		<>
			<Header>Notifications</Header>
			<ol className="flex flex-col">
				{notifications?.map((notification) => (
					<li
						key={notification.id}
						className={cn(
							'flex items-center gap-4 border-b py-2 last:border-0',
							notification.seen && 'text-muted',
						)}
					>
						<Notification {...notification} />
					</li>
				))}
			</ol>
		</>
	);
}
