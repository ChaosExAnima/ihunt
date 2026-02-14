/// <reference lib="WebWorker" />
/// <reference types="vite/client" />

// credit to https://github.com/vite-pwa/docs/issues/132

import { clientsClaim } from 'workbox-core';
import {
	cleanupOutdatedCaches,
	createHandlerBoundToURL,
	precacheAndRoute,
} from 'workbox-precaching';
import { imageCache } from 'workbox-recipes';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import * as z from 'zod';

import { WorkerServer } from './server';

declare const self: ServiceWorkerGlobalScope;

self.__WB_DISABLE_DEV_LOGS = true;

void self.skipWaiting();
clientsClaim();

const entries = self.__WB_MANIFEST;

const server = new WorkerServer();

const trpcRoute = new RegExp('/trpc.*');
registerRoute(trpcRoute, server.routeCallback.bind(server));

// static assets
precacheAndRoute(entries);
imageCache();

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
	badge: z.url(),
	body: z.string().optional(),
	force: z.boolean().optional(),
	icon: z.url(),
	timestamp: z.int().positive(),
	title: z.string(),
});
type EventSchema = z.infer<typeof eventSchema>;

export function onPush(event: PushEvent) {
	const data = toData(event.data?.json(), eventSchema);
	console.log('[Service Worker] Push Received:', data);
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

async function notify(event: EventSchema) {
	const clients = await self.clients.matchAll({
		includeUncontrolled: true,
		type: 'window',
	});
	if (
		!event.force &&
		clients.some(
			(client) => client.focused || client.visibilityState === 'visible',
		)
	) {
		console.log(
			'[Service Worker] Skipping notification as window is visible:',
			event,
		);
		return;
	}
	await self.registration.showNotification(event.title, event);
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
	const { data, error } = schema.safeParse(input);
	if (error) {
		console.warn('[Service Worker] Error parsing payload:', input);
	}
	return data;
}
