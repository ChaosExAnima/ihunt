import { Hunt, Hunter } from '@prisma/client';
import { createHash } from 'node:crypto';
import EventEmitter, { on } from 'node:events';
import webpush, { WebPushError } from 'web-push';

import { MINUTE } from '@/lib/formats';
import { NotifyEventSchema } from '@/lib/schemas';

import { config } from './config';
import { db } from './db';
import { SubscriptionSchema, subscriptionSchema } from './schema';

type EventMap<T> = Record<keyof T, unknown[]>;

interface NotifyArgs {
	event: NotifyEventSchema;
	userId: number;
}

interface NotifyEvents {
	notify: [userId: number, NotifyEventSchema];
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

export function huntCompleteEvent({ hunt }: { hunt: Hunt }): NotifyEventSchema {
	const { id, name, rating } = hunt;
	let body = '';
	if (rating !== null && rating > 0) {
		body = `Your client gave you ${rating} stars.`;
		if (rating > 3) {
			body += ' Good job!';
		}
	}

	return {
		body,
		title: `Hunt ${name} is complete!`,
		type: 'hunt-complete',
		url: `/hunts/${id}`,
	};
}

export function huntStartingEvent({ hunt }: { hunt: Hunt }): NotifyEventSchema {
	const { name, scheduledAt } = hunt;
	const timeDiff = (scheduledAt?.getTime() ?? 0) - Date.now();
	let body = `${name} is starting shortly. Be ready to hunt!`;

	if (timeDiff > MINUTE) {
		body = `${name} is starting in ${Math.ceil(timeDiff / MINUTE)} minutes. Be ready to hunt!`;
	}

	return {
		body,
		title: `${name} is starting soon`,
		type: 'hunt-starting',
	};
}

export function inviteResponseEvent({
	fromHunter,
	hunt,
	response,
}: {
	fromHunter: Hunter;
	hunt: Hunt;
	response: 'accept' | 'decline';
}): NotifyEventSchema {
	if (response === 'accept') {
		return {
			body: `${fromHunter.handle} has accepted your invitation to join the hunt ${hunt.name}`,
			title: `${fromHunter.handle} has joined your hunt`,
			type: 'invite-accept',
		};
	}
	return {
		body: `${fromHunter.handle} has declined your invitation to join the hunt ${hunt.name}`,
		title: `${fromHunter.handle} has declined your invitation`,
		type: 'invite-decline',
	};
}

export function inviteSendEvent({
	fromHunter,
	hunt,
}: {
	fromHunter: Hunter;
	hunt: Hunt;
}): NotifyEventSchema {
	return {
		body: `${fromHunter.handle} has invited you to join them on the hunt ${hunt.name}.`,
		title: `${fromHunter.handle} invited you to hunt`,
		type: 'invite-receive',
		url: `/hunts/${hunt.id}`,
	};
}

export const ee = new IterableEventEmitter<NotifyEvents>();

const icon = `/public/android-chrome-512x512.png`;

export async function notifyUser({ event, userId }: NotifyArgs) {
	// Notify via active subscriptions first.
	ee.emit('notify', userId, { icon, ...event });

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
					JSON.stringify({ icon, ...event }),
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
