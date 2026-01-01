/// <reference lib="WebWorker" />
/// <reference types="vite/client" />

// credit to https://github.com/vite-pwa/docs/issues/132

import {
	cleanupOutdatedCaches,
	createHandlerBoundToURL,
	precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import z from 'zod';

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event) => {
	const schema = z.object({ type: z.string() });
	const { data } = schema.safeParse(event.data);
	if (data?.type === 'SKIP_WAITING') {
		void self.skipWaiting();
	}
});

const entries = self.__WB_MANIFEST;

precacheAndRoute(entries);

// clean old assets
cleanupOutdatedCaches();

// only cache pages and external assets on local build + start or in production
if (import.meta.env.PROD) {
	// to allow work offline
	registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));
}

self.addEventListener('push', onPush);
self.addEventListener('notificationclick', onNotificationClick);

export function onNotificationClick(event: NotificationEvent) {
	const schema = z.object({ url: z.url() });
	const { data } = schema.safeParse(event.notification.data);
	if (!data) {
		return;
	}
	const reactToNotificationClick = new Promise((resolve) => {
		event.notification.close();
		resolve(openUrl(data.url));
	});

	event.waitUntil(reactToNotificationClick);
}

export function onPush(event: PushEvent) {
	console.log('[Service Worker] Push Received.');
	const schema = z.object({ body: z.string().optional(), title: z.string() });
	const { data } = schema.safeParse(event.data?.json());
	if (data) {
		const { body, title } = data;
		event.waitUntil(self.registration.showNotification(title, { body }));
	}
}

function findBestClient(clients: readonly WindowClient[]) {
	let bestClient: null | WindowClient = null;
	for (const client of clients) {
		if (client.focused) {
			return client;
		} else if (client.visibilityState === 'visible') {
			bestClient = client;
		}
	}

	return bestClient || clients[0];
}

async function openUrl(url: string) {
	const clients = await self.clients.matchAll({ type: 'window' });

	if (clients.length !== 0 && 'navigate' in clients[0]) {
		const client = findBestClient(clients);
		await client.navigate(url);
		await client.focus();
	}

	await self.clients.openWindow(url);
}
