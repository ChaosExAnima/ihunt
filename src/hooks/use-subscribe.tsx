import { focusManager, skipToken, useMutation } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import { Bell } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { ToastAction } from '@/components/ui/toast';
import { trpc } from '@/lib/api';

import { toast, useToast } from './use-toast';

export function useNotify() {
	const { toast } = useToast();
	useSubscription(
		trpc.notify.onNotify.subscriptionOptions(skipToken, {
			onData(data) {
				console.log('got data:', data);
				// if (Notification.permission === 'granted') {
				// 	new Notification(data, {
				// 		body: data.body,
				// 	});
				// 	toast({
				// 		description: data.body,
				// 		title: data.title,
				// 	});
				// }
			},
		}),
	);

	return useCallback(
		({ body, title }: { body?: string; title: string }) => {
			if (focusManager.isFocused()) {
				toast({
					description: body,
					title,
				});
			} else if (Notification.permission === 'granted') {
				new Notification(title, {
					body,
				});
			}
		},
		[toast],
	);
}

export function useNotifyRequest() {
	const { mutate } = useMutation(trpc.notify.subscribe.mutationOptions());
	const requested = useRef(false);
	const handleSubscribe = useCallback(() => {
		if (requested.current) {
			return;
		}
		requested.current = true;
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

	useEffect(() => {
		const listener = (event: MessageEvent) => {
			console.log('Received a message from service worker:', event.data);
		};
		// Listen for messages from the service worker
		navigator.serviceWorker.addEventListener('message', listener);
		return () => {
			navigator.serviceWorker.removeEventListener('message', listener);
		};
	}, []);

	const curPermission = Notification.permission;
	const notifyToast = useRef<null | ReturnType<typeof toast>>(null);
	useEffect(() => {
		if (curPermission !== 'granted') {
			notifyToast.current ??= toast({
				action: <NotificationAction onSubscribe={handleSubscribe} />,
				description: 'Please enable notifications',
				duration: Infinity,
				icon: Bell,
				permanent: true,
				title: 'Notifications',
			});
		} else {
			notifyToast?.current?.dismiss();
			handleSubscribe();
		}
	}, [curPermission, handleSubscribe, mutate]);
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
	//  Request permission for notifications
	const permission = await Notification.requestPermission();
	if (permission !== 'granted') {
		console.log('Permission not granted for Notification');
		return;
	}

	const registration = await navigator.serviceWorker.ready;
	try {
		const subscription = await registration.pushManager.subscribe({
			// Replace with your own VAPID public key
			applicationServerKey: import.meta.env.VITE_VAPID_PUB_KEY,
			userVisibleOnly: true,
		});

		await serverCallback(subscription);

		console.log('User is subscribed:', subscription);
	} catch (err) {
		console.log('Failed to subscribe the user: ', err);
	}
}
