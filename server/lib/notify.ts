import { createHash } from 'node:crypto';
import EventEmitter, { on } from 'node:events';
import webpush, { WebPushError } from 'web-push';

import { cacheIterator, keyval } from './cache';
import { config } from './config';
import { SubscriptionSchema } from './schema';

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

	const { vapidPrivKey, vapidPubKey, vapidSubject } = config;
	if (!vapidPrivKey || !vapidPubKey || !vapidSubject) {
		throw new Error('Missing configs for VAPID');
	}
	webpush.setVapidDetails(vapidSubject, vapidPubKey, vapidPrivKey);

	if (!keyval.iterator) {
		throw new Error('Cache does not support iteration');
	}

	let succeeded = false;
	for await (const [key, subscription] of cacheIterator<SubscriptionSchema>(
		keyName(userId),
	)) {
		try {
			const result = await webpush.sendNotification(
				subscription,
				JSON.stringify({ body, title }),
			);
			if (result) {
				succeeded = true;
			} else {
				await keyval.delete(key);
			}
		} catch (err) {
			// When we get GONE, delete the userVapid record.
			if (err instanceof WebPushError && err.statusCode === 410) {
				await keyval.delete(key);
			} else {
				throw err;
			}
		}
	}

	return succeeded;
}

export async function saveSubscription({
	subscription,
	userId,
}: {
	subscription: SubscriptionSchema;
	userId: number;
}) {
	const key = keyName(userId, subscription);

	const value = await keyval.get(key);
	if (value) {
		return false;
	}

	return keyval.set(
		key,
		subscription,
		subscription?.expirationTime ?? undefined,
	);
}

export async function userSubType(userId: number) {
	const type = await keyval.get(`user:${userId}:subtype`);
	return type;
}

function keyName(userId: number, subscription?: SubscriptionSchema) {
	const keyPrefix = `user:${userId}:pushapi`;
	if (!subscription) {
		return keyPrefix;
	}
	const payload = JSON.stringify(subscription);

	const hash = createHash('md5');
	hash.update(payload);
	return `${keyPrefix}:${hash.digest('hex')}`;
}
