import { HUNT_LOCKDOWN_MINUTES, HuntStatus } from '@/lib/constants';
import { MINUTE } from '@/lib/formats';
import { clamp, extractIds } from '@/lib/utils';

import { db, Hunt, Hunter, Prisma } from './db';
import {
	huntAvailableEvent,
	huntCompleteEvent,
	huntStartingEvent,
	notifyHuntsReload,
	notifyUser,
} from './notify';
import { InviteStatus } from './schema';

export const huntDisplayInclude = {
	hunters: {
		include: {
			avatar: true,
		},
	},
	photos: true,
} as const satisfies Prisma.HuntInclude;

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
	return (
		(hunt.status === HuntStatus.Available ||
			hunt.status === HuntStatus.Active) &&
		hunt.scheduledAt &&
		hunt.scheduledAt.getTime() >=
			Date.now() - HUNT_LOCKDOWN_MINUTES * MINUTE
	);
}

export async function onHuntInterval() {
	// Get upcoming hunts within scheduled time.
	const lockdownTime = new Date(Date.now() - MINUTE * HUNT_LOCKDOWN_MINUTES);
	const upcomingHunts = await db.hunt.findMany({
		include: {
			hunters: {
				select: { userId: true },
			},
		},
		where: {
			scheduledAt: {
				lte: lockdownTime,
			},
			status: HuntStatus.Available,
		},
	});

	// Send notifications that hunt is upcoming.
	const notifyPromises: Promise<boolean>[] = [];
	for (const hunt of upcomingHunts) {
		for (const hunter of hunt.hunters) {
			if (hunter.userId) {
				notifyPromises.push(
					notifyUser({
						event: huntStartingEvent({ hunt }),
						userId: hunter.userId,
					}),
				);
			}
		}
	}
	const results = await Promise.all(notifyPromises);
	const total = results.filter((v): v is true => !!v).length;
	if (total) {
		console.log(
			`Notified ${total} users for ${upcomingHunts.length} hunts`,
		);
	}

	// Set scheduled hunts to active.
	const now = new Date();
	const liveHunts = await db.hunt.updateMany({
		data: {
			status: HuntStatus.Active,
		},
		where: {
			scheduledAt: {
				gte: now,
			},
			status: HuntStatus.Available,
		},
	});
	if (liveHunts.count > 0) {
		console.log(`Set ${liveHunts.count} hunts to active`);
	}

	// Expire all invites.
	const inviteResults = await db.huntInvite.updateMany({
		data: { status: InviteStatus.Expired },
		where: {
			huntId: {
				in: extractIds(upcomingHunts),
			},
			status: InviteStatus.Pending,
		},
	});
	if (inviteResults.count) {
		console.log(`Expired ${inviteResults.count} invites`);
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
		hunt.paidHunters ||
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
		if (hunter.userId) {
			await notifyUser({
				event: huntCompleteEvent({ hunt }),
				userId: hunter.userId,
			});
		}
	}

	// Mark as paid so we don't do it again.
	await db.hunt.update({
		data: {
			paidHunters: true,
		},
		where: { id: hunt.id },
	});

	return {
		paymentPerHunter: perHunterPayment,
		totalPayment: hunt.payment,
	};
}
