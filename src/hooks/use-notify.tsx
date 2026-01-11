import { skipToken, useMutation } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import {
	Bell,
	CrosshairIcon,
	MailCheckIcon,
	MailIcon,
	MailXIcon,
	StarIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { trpc } from '@/lib/api';
import { NotifyEventSchema } from '@/lib/schemas';

import { useInvalidate } from './use-invalidate';

export function useNotifyRequest() {
	const { mutate } = useMutation(trpc.notify.subscribe.mutationOptions());

	const handleSubscribe = useCallback(() => {
		void requestNotifyPermission((subscription) => {
			const {
				endpoint,
				expirationTime = null,
				keys: { auth, p256dh } = {},
			} = subscription.toJSON();
			if (!endpoint || !auth || !p256dh) {
				return;
			}
			mutate({
				endpoint,
				expirationTime,
				keys: {
					auth,
					p256dh,
				},
			});
		});
	}, [mutate]);

	return handleSubscribe;
}

export function useNotifyRequestToast() {
	const handleSubscribe = useNotifyRequest();
	const curPermission = Notification.permission;
	const notifyToast = useRef<null | ReturnType<typeof toast>>(null);
	useEffect(() => {
		if (localStorage.getItem('notify-toast') === 'dismissed') {
			return;
		}
		if (curPermission !== 'granted') {
			notifyToast.current ??= toast('Notifications', {
				action: {
					label: 'Enable',
					onClick: handleSubscribe,
				},
				description: 'Please enable notifications',
				duration: Infinity,
				icon: <Bell className="size-4" />,
				onDismiss() {
					if (Notification.permission !== 'granted') {
						localStorage.setItem('notify-toast', 'dismissed');
					}
				},
			});
		} else {
			if (notifyToast?.current) {
				toast.dismiss(notifyToast.current);
			}
			handleSubscribe();
		}
	}, [curPermission, handleSubscribe]);
}

export function useNotifySubscribe() {
	const invalidate = useInvalidate();
	useSubscription(
		trpc.notify.onNotify.subscriptionOptions(skipToken, {
			onData(event) {
				console.log('Notify received:', event);

				invalidate([trpc.hunt.getAvailable.queryKey()]);
				if (event.title) {
					toast(event.title, {
						description: event.body,
						icon: typeToIcon(event.type),
					});
				}
			},
		}),
	);
}

async function requestNotifyPermission(
	serverCallback: (subscription: PushSubscription) => unknown,
) {
	//  Request permission for notifications
	const permission = await Notification.requestPermission();
	if (permission !== 'granted') {
		return;
	}

	const registration = await navigator.serviceWorker.ready;
	try {
		const subscription = await registration.pushManager.subscribe({
			// TODO: Import key via API to allow it being set during runtime.
			applicationServerKey: import.meta.env.VITE_VAPID_PUB_KEY,
			userVisibleOnly: true,
		});

		await serverCallback(subscription);
	} catch (err) {
		console.log('Failed to subscribe the user: ', err);
	}
}

function typeToIcon(type: NotifyEventSchema['type']) {
	switch (type) {
		case 'hunt-complete':
			return <StarIcon />;
		case 'hunt-starting':
		case 'hunt-update':
			return <CrosshairIcon />;
		case 'invite-accept':
			return <MailCheckIcon />;
		case 'invite-decline':
			return <MailXIcon />;
		default:
			return <MailIcon />;
	}
}
