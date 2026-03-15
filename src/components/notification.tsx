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

	if (!notification.url) {
		return notify;
	}
	return (
		<Link to={notification.url} className="flex items-center gap-4">
			{notify}
		</Link>
	);
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
