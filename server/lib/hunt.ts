import { TRPCError } from '@trpc/server';

import { HUNT_LOCKDOWN_MINUTES, HuntStatus } from '@/lib/constants';
import { MINUTE } from '@/lib/formats';
import { clamp, extractIds } from '@/lib/utils';

import { config } from './config';
import { db, Hunt, Hunter, Prisma } from './db';
import {
	huntAvailableEvent,
	huntCompleteEvent,
	huntStartingEvent,
	notifyHunter,
	notifyHuntsReload,
} from './notify';
import { InviteStatus } from './schema';
import { logger } from './server';

export const huntDisplayInclude = {
	huntHunters: {
		include: {
			hunter: {
				include: {
					avatar: true,
				},
			},
		},
		where: {
			status: InviteStatus.Accepted,
		},
	},
	photos: true,
} as const satisfies Prisma.HuntInclude;

export function assertHuntsEnabled() {
	if (isHuntsDisabled()) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'Hunts are disabled',
		});
	}
}

export function calculateNewRating({
	hunterRating,
	huntRating,
}: {
	hunterRating: number;
	huntRating: number;
}): number {
	// Take the average of the hunter and hunt rating, and clamp it from 0-5.
	return clamp({ input: (huntRating + hunterRating) / 2, max: 5 });
}

export function huntInLockdown(hunt: Hunt) {
	const lockdownTime = Date.now() - HUNT_LOCKDOWN_MINUTES * MINUTE;
	return (
		(hunt.status === HuntStatus.Available ||
			hunt.status === HuntStatus.Active) &&
		hunt.scheduledAt &&
		hunt.scheduledAt.getTime() <= lockdownTime
	);
}

export function isHuntsDisabled() {
	return config.huntsDisabled;
}

const huntsNotified = new Set<number>();

export async function onHuntInterval() {
	if (isHuntsDisabled()) {
		return;
	}

	// Get upcoming hunts within scheduled time.
	const lockdownTime = new Date(Date.now() - MINUTE * HUNT_LOCKDOWN_MINUTES);
	const upcomingHunts = await db.hunt.findMany({
		include: {
			huntHunters: {
				include: {
					hunter: true,
				},
			},
		},
		where: {
			scheduledAt: {
				lte: lockdownTime,
			},
			status: HuntStatus.Available,
		},
	});

	if (upcomingHunts.length === 0) {
		return;
	}

	// Send notifications that hunt is upcoming.
	const notifyPromises: Promise<boolean>[] = [];
	for (const hunt of upcomingHunts) {
		if (huntsNotified.has(hunt.id)) {
			continue;
		}

		for (const { hunter } of hunt.huntHunters) {
			notifyPromises.push(
				notifyHunter({
					event: huntStartingEvent({ hunt }),
					hunter,
				}),
			);
		}
		huntsNotified.add(hunt.id);
	}
	const results = await Promise.all(notifyPromises);
	const total = results.filter((v): v is true => !!v).length;
	if (total) {
		logger.info(
			`Notified ${total} users for ${upcomingHunts.length} hunts`,
		);
	}

	// Expire all invites.
	const inviteResults = await db.huntHunter.updateMany({
		data: { status: InviteStatus.Expired },
		where: {
			huntId: {
				in: extractIds(upcomingHunts),
			},
			status: InviteStatus.Pending,
		},
	});
	if (inviteResults.count) {
		logger.info(`Expired ${inviteResults.count} invites`);
	}
}

export async function updateHunt({
	hunt,
	hunters,
}: {
	hunt: Hunt;
	hunters: Hunter[];
}) {
	// Hunt newly up, notify hunters.
	if (hunt.status === HuntStatus.Available) {
		notifyHuntsReload(huntAvailableEvent());
		return null;
	}

	// Early checks to ensure we're good.
	const { payment, rating: huntRating } = hunt;
	if (
		hunt.status !== HuntStatus.Complete ||
		payment <= 0 ||
		!huntRating ||
		hunters.length === 0
	) {
		notifyHuntsReload();
		return null;
	}

	const aliveHunters = hunters.filter((hunter) => hunter.alive);

	const perHunterPayment = Math.floor(payment / aliveHunters.length); // Rounding errors to iHunt, inc

	// Update and notify the hunters.
	for (const hunter of aliveHunters) {
		await db.huntHunter.update({
			where: {
				huntId_hunterId: {
					hunterId: hunter.id,
					huntId: hunt.id,
				},
			},
			data: {
				paid: perHunterPayment,
			},
		});

		const newRating = calculateNewRating({
			hunterRating: hunter.rating,
			huntRating: huntRating,
		});

		await db.hunter.update({
			data: {
				money: {
					increment: perHunterPayment,
				},
				rating: {
					set: newRating,
				},
			},
			where: { id: hunter.id },
		});

		await notifyHunter({
			event: huntCompleteEvent({ hunt }),
			hunter,
		});
	}

	return {
		paymentPerHunter: perHunterPayment,
		totalPayment: hunt.payment,
	};
}
