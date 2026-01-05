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

import { Button } from '@/components/ui/button';
import { ToastAction } from '@/components/ui/toast';
import { trpc } from '@/lib/api';
import { NotifyEventSchema } from '@/lib/schemas';

import { useInvalidate } from './use-invalidate';
import { toast, useToast } from './use-toast';

export function useNotify() {
	const { toast } = useToast();
	return useCallback(
		({ body, title }: NotifyEventSchema) => {
			toast({
				description: body,
				title,
			});
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
				title: 'Notifications',
			});
		} else {
			notifyToast?.current?.dismiss();
			handleSubscribe();
		}
	}, [curPermission, handleSubscribe, mutate]);

	const invalidate = useInvalidate();
	useSubscription(
		trpc.notify.onNotify.subscriptionOptions(skipToken, {
			onData(data) {
				invalidate([trpc.hunt.getAvailable.queryKey()]);
				if (data.title) {
					toast({
						description: data.body,
						icon: typeToIcon(data.type),
						title: data.title,
					});
				}
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
	//  Request permission for notifications
	const permission = await Notification.requestPermission();
	if (permission !== 'granted') {
		// TODO: Handle not granting permission better.
		console.log('Permission not granted for Notification');
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
			return StarIcon;
		case 'hunt-starting':
			return CrosshairIcon;
		case 'invite-accept':
			return MailCheckIcon;
		case 'invite-decline':
			return MailXIcon;
		default:
			return MailIcon;
	}
}
