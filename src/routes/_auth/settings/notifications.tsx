import { createFileRoute, Link } from '@tanstack/react-router';
import { useCallback, useId, useMemo } from 'react';

import { Header } from '@/components/header';
import { SettingBlock } from '@/components/settings/setting-block';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useNotifyRequest } from '@/hooks/use-notify';
import { useSettings } from '@/hooks/use-settings';
import { NotifyTypeSchema } from '@/lib/schemas';

export const Route = createFileRoute('/_auth/settings/notifications')({
	component: NotificationsPage,
});

const notificationNames: Partial<Record<NotifyTypeSchema, string>> = {
	'hunt-update': 'New hunts available',
	'hunt-complete': 'Hunt complete',
	'hunt-starting': 'Hunt starting',
	'invite-accept': 'Sent invitation accepted',
	'invite-decline': 'Sent invitation declined',
	'invite-receive': 'New invitation',
};
/* eslint-enable */

function NotificationControl({
	fieldName,
	id,
	label,
	notifications,
	onUpdate,
	pending,
}: {
	fieldName: string;
	id: string;
	label: string;
	notifications: Partial<Record<NotifyTypeSchema, boolean>>;
	onUpdate: (key: string) => void;
	pending: boolean;
}) {
	const handleChange = useCallback(() => {
		onUpdate(fieldName);
	}, [fieldName, onUpdate]);
	return (
		<SettingBlock id={`${id}-${fieldName}`} label={label}>
			<Switch
				checked={
					// Default to on.
					notifications[fieldName as NotifyTypeSchema] ?? true
				}
				data-key={fieldName}
				disabled={pending}
				id={`${id}-${fieldName}`}
				onCheckedChange={handleChange}
			/>
		</SettingBlock>
	);
}

function NotificationsPage() {
	const [settings, { isPending, mutate: updateSettings }] = useSettings();
	const notifications = useMemo(
		() => settings?.notifications ?? {},
		[settings],
	);
	const idBase = useId();
	const handleChange = useCallback(
		(key: string) => {
			const value = notifications[key as NotifyTypeSchema] ?? true;
			updateSettings({
				notifications: {
					[key as NotifyTypeSchema]: !value,
				},
			});
		},
		[notifications, updateSettings],
	);

	const handleRequestNotify = useNotifyRequest();

	const needsPermission = Notification.permission !== 'granted';

	return (
		<>
			<Header>Notifications</Header>
			{needsPermission && (
				<>
					<p className="text-accent">
						You have disabled notifications.
					</p>
					<Button onClick={handleRequestNotify} variant="success">
						Enable notifications
					</Button>
				</>
			)}
			<section className="my-4 grid grid-cols-[1fr_auto] items-center gap-4">
				{Object.entries(notificationNames).map(([key, label]) => (
					<NotificationControl
						fieldName={key}
						id={idBase}
						key={key}
						label={label}
						notifications={notifications}
						onUpdate={handleChange}
						pending={isPending || needsPermission}
					/>
				))}
			</section>
			<Button asChild variant="secondary">
				<Link className="mt-auto" to="/settings">
					Back
				</Link>
			</Button>
		</>
	);
}
