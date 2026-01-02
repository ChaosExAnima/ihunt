import { createHash } from 'node:crypto';
import EventEmitter, { on } from 'node:events';
import webpush, { WebPushError } from 'web-push';

import { config } from './config';
import { db } from './db';
import { SubscriptionSchema, subscriptionSchema } from './schema';

type EventMap<T> = Record<keyof T, unknown[]>;

interface NotifyArgs {
	body?: string;
	title: string;
	userId: number;
}

interface SubscribeEvents {
	notify: [
		userId: number,
		(
			| { body?: string; title: string; type: 'message' }
			| { id?: number; type: 'hunt' | 'invite' }
		),
	];
}

class IterableEventEmitter<T extends EventMap<T>> extends EventEmitter<T> {
	toIterable<TEventName extends keyof T & string>(
		eventName: TEventName,
		opts?: NonNullable<Parameters<typeof on>[2]>,
	): AsyncIterable<T[TEventName]> {
		return on(this as EventEmitter, eventName, opts) as AsyncIterable<
			T[TEventName]
		>;
	}
}

export const ee = new IterableEventEmitter<SubscribeEvents>();

export async function notifyUser({ body, title, userId }: NotifyArgs) {
	// Notify via active subscriptions first.
	ee.emit('notify', userId, { body, title, type: 'message' });

	const listening = ee.listenerCount('notify');

	if (listening > 0) {
		return;
	}

	const { vapidPrivKey, vapidPubKey, vapidSubject } = config;
	if (!vapidPrivKey || !vapidPubKey || !vapidSubject) {
		throw new Error('Missing configs for VAPID');
	}
	webpush.setVapidDetails(vapidSubject, vapidPubKey, vapidPrivKey);

	const endpoints = await db.userVapid.findMany({
		where: {
			userId,
		},
	});

	const now = new Date();
	const toPrune: string[] = [];
	let succeeded = false;
	for (const endpoint of endpoints) {
		if (endpoint.expirationTime && endpoint.expirationTime > now) {
			toPrune.push(endpoint.id);
		} else {
			const subscription = subscriptionSchema.parse(
				JSON.parse(endpoint.payload),
			);
			try {
				const result = await webpush.sendNotification(
					subscription,
					JSON.stringify({ body, title }),
				);
				if (result) {
					succeeded = true;
				} else {
					toPrune.push(endpoint.id);
				}
			} catch (err) {
				// When we get GONE, delete the userVapid record.
				if (err instanceof WebPushError && err.statusCode === 410) {
					toPrune.push(endpoint.id);
				} else {
					throw err;
				}
			}
		}

		if (toPrune.length > 0) {
			await db.userVapid.deleteMany({
				where: { id: { in: toPrune } },
			});
		}
		return succeeded;
	}
}

export async function saveSubscription({
	subscription,
	userId,
}: {
	subscription: SubscriptionSchema;
	userId: number;
}) {
	const payload = JSON.stringify(subscription);
	const expirationTime = subscription.expirationTime
		? new Date(subscription.expirationTime)
		: null;

	const hash = createHash('md5');
	hash.update(payload);
	const id = hash.copy().digest('base64');

	const existing = await db.userVapid.findUnique({
		where: { id },
	});
	if (existing) {
		return null;
	}

	return db.userVapid.create({
		data: {
			expirationTime,
			id: hash.digest('base64'),
			payload,
			userId,
		},
	});
}
