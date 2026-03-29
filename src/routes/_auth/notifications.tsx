import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Header } from '@/components/header';
import { Loading } from '@/components/loading';
import { Notification } from '@/components/notification';
import { trpc } from '@/lib/api';
import { SECOND } from '@/lib/formats';
import { cn } from '@/lib/styles';

export const Route = createFileRoute('/_auth/notifications')({
	component: RouteComponent,
	loader({ context: { queryClient } }) {
		void queryClient.prefetchQuery(trpc.notify.list.queryOptions());
	},
});

function RouteComponent() {
	const { isLoading, data } = useQuery({
		...trpc.notify.list.queryOptions(),
		refetchInterval: 30 * SECOND,
	});
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
			{notifications.length > 0 && (
				<ol className="flex flex-col gap-3">
					{notifications.map((notification) => (
						<li
							key={notification.id}
							className={cn(
								'border-border flex items-center gap-4 rounded-lg border px-3 py-2',
								notification.seen && 'text-muted',
							)}
						>
							<Notification {...notification} />
						</li>
					))}
				</ol>
			)}
			{notifications.length === 0 && (
				<p className="text-muted">
					You'll get notifications about your hunts here!
				</p>
			)}
		</>
	);
}
