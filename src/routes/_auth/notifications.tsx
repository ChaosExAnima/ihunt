import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Header } from '@/components/header';
import { Loading } from '@/components/loading';
import { Notification } from '@/components/notification';
import { trpc } from '@/lib/api';
import { cn } from '@/lib/styles';

export const Route = createFileRoute('/_auth/notifications')({
	component: RouteComponent,
	loader({ context: { queryClient } }) {
		void queryClient.prefetchQuery(trpc.notify.list.queryOptions());
	},
});

function RouteComponent() {
	const { isLoading, data } = useQuery(trpc.notify.list.queryOptions());
	const [notifications, setNotifications] = useState<typeof data>();

	if (data && !notifications) {
		setNotifications(data);
	}

	const client = useQueryClient();
	const { mutate } = useMutation(
		trpc.notify.read.mutationOptions({
			onSuccess() {
				client.setQueryData(trpc.notify.unreadCount.queryKey(), 0);
			},
		}),
	);

	useEffect(() => {
		if (!isLoading) {
			mutate();
		}
	}, [mutate, isLoading]);

	if (isLoading || !notifications) {
		return <Loading />;
	}

	return (
		<>
			<Header>Notifications</Header>
			<ol className="flex flex-col">
				{notifications.map((notification) => (
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
