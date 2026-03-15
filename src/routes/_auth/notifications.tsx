import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { Header } from '@/components/header';
import { Loading } from '@/components/loading';
import { NotificationIcon } from '@/components/notification';
import { trpc } from '@/lib/api';
import { dateFormat } from '@/lib/formats';
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

	if (isLoading) {
		return <Loading />;
	}

	return (
		<>
			<Header>Notifications</Header>
			<ol>
				{notifications?.map((notification) => (
					<li
						key={notification.id}
						className={cn(
							'flex items-center gap-4',
							notification.seen && 'text-muted',
						)}
					>
						<NotificationIcon type={notification.type} />
						<div className="grow">
							{notification.title && (
								<h2>{notification.title}</h2>
							)}
							{notification.body && (
								<p className="text-sm">{notification.body}</p>
							)}
							<p
								className={cn(
									'text-sm',
									!notification.seen &&
										'text-muted-foreground',
								)}
							>
								{dateFormat(notification.created, true)}
							</p>
						</div>
					</li>
				))}
			</ol>
		</>
	);
}
