import { TRPCError } from '@trpc/server';
import { FastifyBaseLogger } from 'fastify';

import {
	HUNT_LOCKDOWN_MINUTES,
	HUNTER_LOW_RATING,
	HUNTER_TOP_MIN_RATING,
	HuntStatus,
} from '@/lib/constants';
import { MINUTE } from '@/lib/formats';
import { clamp, extractIds } from '@/lib/utils';

import { config } from './config';
import { db, Hunt, Prisma } from './db';
import { isCodeNPC } from './hunter';
import {
	huntAvailableEvent,
	huntCompleteEvent,
	huntStartingEvent,
	notifyHunter,
	notifyHunters,
	notifyHuntsReload,
	ratingHigh,
	ratingLow,
} from './notify';
import { InviteStatus } from './schema';

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

export function assertHuntsEnabled(code?: string | null, isAdmin?: boolean) {
	if (isHuntsDisabled(code, isAdmin)) {
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

export function isHuntsDisabled(code?: string | null, isAdmin?: boolean) {
	if ((code && isCodeNPC(code)) || isAdmin) {
		return false;
	}
	return config.huntsDisabled;
}

const huntsNotified = new Set<number>();

export async function onHuntInterval(logger?: FastifyBaseLogger) {
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
		logger?.info(
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
		logger?.info(`Expired ${inviteResults.count} invites`);
	}
}

export async function updateHunt({
	hunt,
	hunterIds,
}: {
	hunt: Hunt;
	hunterIds?: number[];
}) {
	// Adjust hunt invites
	if (hunterIds) {
		await db.huntHunter.updateMany({
			data: {
				status: InviteStatus.Expired,
			},
			where: {
				huntId: hunt.id,
				hunterId: {
					notIn: hunterIds,
				},
				status: InviteStatus.Accepted,
			},
		});
		for (const hunterId of hunterIds) {
			await db.huntHunter.upsert({
				where: {
					huntId_hunterId: {
						hunterId,
						huntId: hunt.id,
					},
				},
				update: {
					status: InviteStatus.Accepted,
				},
				create: {
					status: InviteStatus.Accepted,
					hunterId,
					huntId: hunt.id,
				},
			});
		}
	}

	// Hunt newly up, notify hunters.
	hunterIds ??= [];
	if (hunt.status === HuntStatus.Available) {
		await notifyHunters({
			event: huntAvailableEvent(),
			hunterIds,
		});
		return;
	}

	if (hunt.status === HuntStatus.Active) {
		await notifyHunters({
			event: huntStartingEvent({ hunt, noTime: true }),
			hunterIds,
		});
		return;
	}

	notifyHuntsReload();
}

export async function completeHunt({
	huntId,
	payment,
	huntRating,
	comment,
	logger,
}: {
	huntId: number;
	payment: number;
	huntRating: number;
	comment?: string;
	logger: FastifyBaseLogger;
}) {
	const huntHunters = await db.huntHunter.findMany({
		where: {
			huntId,
			status: InviteStatus.Accepted,
		},
		include: {
			hunter: true,
		},
	});
	const hunt = await db.hunt.findUniqueOrThrow({
		where: {
			id: huntId,
		},
	});

	if (!huntHunters.length || hunt.status === HuntStatus.Complete) {
		return;
	}

	const hunters = huntHunters.map(({ hunter }) => hunter);
	const aliveHunters = hunters.filter(({ alive }) => alive);

	const perHunterPayment = Math.floor(payment / aliveHunters.length); // Rounding errors to iHunt, inc

	await db.hunt.update({
		where: {
			id: huntId,
		},
		data: {
			comment,
			payment,
			rating: huntRating,
			status: HuntStatus.Complete,
		},
	});

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

		let newRating = clamp({
			input: (huntRating + hunter.rating) / 2,
			max: 5,
			min: 1,
		});
		newRating = Math.round(newRating * 10) / 10;

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
			logger,
		});

		logger.info(
			`Updated hunter ${hunter.handle} (${hunter.id}) rating from ${hunter.rating} to ${newRating} and paid ${perHunterPayment} for hunt ${hunt.name} (${hunt.id})`,
		);

		if (
			newRating >= HUNTER_TOP_MIN_RATING &&
			hunter.rating < HUNTER_TOP_MIN_RATING
		) {
			await notifyHunter({
				event: ratingHigh({ hunterId: hunter.id }),
				hunter,
				logger,
			});
		} else if (
			newRating <= HUNTER_LOW_RATING &&
			hunter.rating > HUNTER_LOW_RATING
		) {
			await notifyHunter({
				event: ratingLow({ hunterId: hunter.id }),
				hunter,
				logger,
			});
		}
	}
}
