/// <reference lib="WebWorker" />
/// <reference types="vite/client" />

// credit to https://github.com/vite-pwa/docs/issues/132

import { clientsClaim } from 'workbox-core';
import {
	cleanupOutdatedCaches,
	createHandlerBoundToURL,
	precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import z from 'zod';

declare const self: ServiceWorkerGlobalScope;

await self.skipWaiting();
clientsClaim();

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
	const data = toData(event.notification.data, z.object({ url: z.url() }));
	if (!data) {
		return;
	}
	const reactToNotificationClick = new Promise((resolve) => {
		event.notification.close();
		resolve(openUrl(data.url));
	});

	event.waitUntil(reactToNotificationClick);
}
const eventSchema = z.object({
	body: z.string().optional(),
	title: z.string(),
});
type EventSchema = z.infer<typeof eventSchema>;

export function onPush(event: PushEvent) {
	console.log('[Service Worker] Push Received.');
	const data = toData(event.data?.json(), eventSchema);
	if (data) {
		event.waitUntil(notify(data));
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

async function notify({ body, title }: EventSchema) {
	const clients = await self.clients.matchAll({
		includeUncontrolled: true,
		type: 'window',
	});
	if (
		clients.some(
			(client) => client.focused || client.visibilityState === 'visible',
		)
	) {
		return;
	}
	await self.registration.showNotification(title, { body });
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

function toData<TSchema extends z.ZodObject>(input: unknown, schema: TSchema) {
	const { data } = schema.safeParse(input);
	return data;
}
