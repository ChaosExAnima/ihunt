import {
	StarIcon,
	CrosshairIcon,
	MailCheckIcon,
	MailXIcon,
	MailIcon,
	LucideProps,
} from 'lucide-react';

import { NotifyTypeSchema } from '@/lib/schemas';

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
