import { skipToken, useMutation } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { Bell } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { typeToIcon } from '@/components/notification';
import { Button } from '@/components/ui/button';
import { ToastAction } from '@/components/ui/toast';
import { trpc } from '@/lib/api';

import { useInvalidate } from './use-invalidate';
import { toast } from './use-toast';

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
	const curPermission =
		'Notification' in window ? Notification.permission : null;
	const notifyToast = useRef<null | ReturnType<typeof toast>>(null);
	useEffect(() => {
		if (
			localStorage.getItem('notify-toast') === 'dismissed' ||
			!curPermission
		) {
			return;
		}
		if (curPermission !== 'granted') {
			notifyToast.current ??= toast({
				action: <NotificationAction onSubscribe={handleSubscribe} />,
				description: 'Please enable notifications',
				duration: Infinity,
				icon: Bell,
				onOpenChange(open) {
					if (!open && Notification.permission !== 'granted') {
						localStorage.setItem('notify-toast', 'dismissed');
					}
				},
				title: 'Notifications',
			});
		} else {
			notifyToast?.current?.dismiss();
			handleSubscribe();
		}
	}, [curPermission, handleSubscribe]);
}

export function useNotifySubscribe() {
	const invalidate = useInvalidate();
	useSubscription(
		trpc.notify.onNotify.subscriptionOptions(skipToken, {
			onData(event) {
				// Invalidate relevant queries
				const toInvalidate = [trpc.notify.pathKey()];
				if (
					event.type.startsWith('hunt-') ||
					event.type.startsWith('invite-')
				) {
					toInvalidate.push(trpc.hunt.getAvailable.queryKey());
				} else if (event.type.startsWith('hunter-')) {
					toInvalidate.push(
						trpc.hunter.pathKey(),
						trpc.auth.me.queryKey(),
					);
				}

				if (event.title) {
					toast({
						description: event.body,
						icon: typeToIcon(event.type),
						title: event.title,
					});
				}

				invalidate(toInvalidate);
			},
		}),
	);
}

function NotificationAction({ onSubscribe }: { onSubscribe: () => void }) {
	return (
		<ToastAction altText="Enable notifications" asChild>
			<Button onClick={onSubscribe} variant="ghost">
				Enable notifications
			</Button>
		</ToastAction>
	);
}

async function requestNotifyPermission(
	serverCallback: (subscription: PushSubscription) => unknown,
) {
	const vapidKey = __VAPID_KEY__;
	if (!vapidKey) {
		return;
	}

	//  Request permission for notifications
	const permission = await Notification.requestPermission();
	if (permission !== 'granted') {
		return;
	}

	const registration = await navigator.serviceWorker.ready;
	try {
		const subscription = await registration.pushManager.subscribe({
			// TODO: Import key via API to allow it being set during runtime.
			applicationServerKey: vapidKey,
			userVisibleOnly: true,
		});

		await serverCallback(subscription);
	} catch (err) {
		console.log('Failed to subscribe the user: ', err);
	}
}
