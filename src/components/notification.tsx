import { Link } from '@tanstack/react-router';
import {
	StarIcon,
	CrosshairIcon,
	MailCheckIcon,
	MailXIcon,
	MailIcon,
	LucideProps,
} from 'lucide-react';

import { dateFormat } from '@/lib/formats';
import { NotifyEventSchema, NotifyTypeSchema } from '@/lib/schemas';
import { cn } from '@/lib/styles';

export function Notification(
	notification: NotifyEventSchema & { created: Date; seen: boolean },
) {
	const notify = (
		<>
			<NotificationIcon type={notification.type} />
			<div className="grow">
				{notification.title && <h2>{notification.title}</h2>}
				{notification.body && (
					<p className="text-sm">{notification.body}</p>
				)}
				<p
					className={cn(
						'text-sm',
						!notification.seen && 'text-muted-foreground',
					)}
				>
					{dateFormat(notification.created, true)}
				</p>
			</div>
		</>
	);

	const className = 'flex items-center gap-4';

	if (notification.huntId) {
		return (
			<Link
				to="/hunts/$huntId"
				params={{ huntId: notification.huntId.toString() }}
				className={className}
			>
				{notify}
			</Link>
		);
	}

	if (notification.url) {
		return (
			<Link to={notification.url} className={className}>
				{notify}
			</Link>
		);
	}
	return notify;
}

export function NotificationIcon({
	type,
	...rest
}: { type: NotifyTypeSchema } & LucideProps) {
	const Icon = typeToIcon(type);
	return <Icon {...rest} />;
}

export function typeToIcon(type: NotifyTypeSchema) {
	switch (type) {
		case 'hunt-complete':
			return StarIcon;
		case 'hunt-starting':
		case 'hunt-update':
			return CrosshairIcon;
		case 'invite-accept':
			return MailCheckIcon;
		case 'invite-decline':
			return MailXIcon;
		default:
			return MailIcon;
	}
}
