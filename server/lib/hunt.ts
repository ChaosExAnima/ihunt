import {
	HUNT_LOCKDOWN_MINUTES,
	HUNTER_LOW_RATING,
	HUNTER_TOP_MIN_RATING,
	HuntStatus,
} from '@ihunt/lib/constants';
import { MINUTE } from '@ihunt/lib/formats';
import { notifyEventSchema } from '@ihunt/lib/schemas';
import { clamp, extractIds } from '@ihunt/lib/utils';
import { TRPCError } from '@trpc/server';
import { FastifyBaseLogger } from 'fastify';

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
import { HuntSpotStatus } from './schema';
import { hunterIdsByHunt, syncSpotsForHunt } from './spot';

export const huntDisplayInclude = {
	spots: {
		include: {
			hunter: {
				include: {
					avatar: true,
				},
			},
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

export async function onHuntInterval(logger?: FastifyBaseLogger) {
	if (isHuntsDisabled()) {
		return;
	}

	await lockdownHunts(logger);
	await endActiveHunts(logger);
}

async function lockdownHunts(logger?: FastifyBaseLogger) {
	const lockdownTime = new Date(Date.now() - MINUTE * HUNT_LOCKDOWN_MINUTES);
	const upcomingHunts = await db.hunt.findMany({
		where: {
			scheduledAt: { lte: lockdownTime },
			status: HuntStatus.Available,
		},
	});

	if (upcomingHunts.length === 0) {
		return;
	}

	const upcomingHuntsIds = extractIds(upcomingHunts);
	await db.huntSpot.updateMany({
		where: { huntId: { in: upcomingHuntsIds }, hunterId: null },
		data: { status: HuntSpotStatus.Locked },
	});

	const huntSpots = await db.huntSpot.findMany({
		where: { huntId: { in: upcomingHuntsIds }, status: HuntSpotStatus.Taken },
		include: { hunter: true },
	});

	// Send notifications that hunt is upcoming.
	let total = 0;
	for (const hunt of upcomingHunts) {
		// Extract hunters from spots
		const hunters = [];
		for (const spot of huntSpots) {
			if (spot.huntId === hunt.id && spot.hunter) {
				hunters.push(spot.hunter);
			}
		}

		if (!hunters.length) {
			continue;
		}

		try {
			for (const hunter of hunters) {
				const notifications = await db.notification.findMany({
					where: {
						type: 'hunt-starting',
						hunterId: hunt.id,
					},
				});
				const notification = notifications.filter(
					({ hunterId, event: rawEvent }) => {
						if (typeof rawEvent !== 'string') {
							return false;
						}
						const event = notifyEventSchema.parse(JSON.parse(rawEvent));
						return hunter.id === hunterId && event.huntId === hunt.id;
					},
				);
				if (notification) {
					continue;
				}
				await notifyHunter({
					event: huntStartingEvent({ hunt }),
					hunter,
					logger,
				});
				total++;
			}
		} catch (err) {
			logger?.error(err, `Error notifying hunters for hunt ${hunt.id}`);
		}
	}
}

async function endActiveHunts(logger?: FastifyBaseLogger) {
	const endTime = new Date(Date.now() + MINUTE * HUNT_LOCKDOWN_MINUTES);
	const upcomingHunts = await db.hunt.updateManyAndReturn({
		select: { id: true },
		data: { status: HuntStatus.Reviewing },
		where: {
			scheduledAt: {
				lte: endTime,
			},
			status: HuntStatus.Active,
		},
	});

	if (upcomingHunts.length > 0) {
		logger?.info(
			`Ended hunts: ${upcomingHunts.map(({ id }) => id).join(', ')}`,
		);
	}
}

export async function updateHunt({
	hunt,
	hunterIds,
	logger,
}: {
	hunt: Hunt;
	hunterIds?: number[];
	logger?: FastifyBaseLogger;
}) {
	await syncSpotsForHunt(hunt, logger);

	if (!hunterIds?.length) {
		notifyHuntsReload();
		return;
	}

	const spots = await db.huntSpot.updateManyAndReturn({
		where: { huntId: hunt.id },
		data: {
			hunterId: null,
			status: HuntSpotStatus.Locked,
			fromHunterId: null,
		},
	});

	const hunterIdsToClaim = [...hunterIds];
	for (const spot of spots) {
		const hunterId = hunterIdsToClaim.pop();
		await db.huntSpot.update({
			where: { id: spot.id },
			data: { hunterId },
		});
	}

	// Hunt newly up, notify hunters.
	if (hunt.status === HuntStatus.Available) {
		await notifyHunters({
			event: huntAvailableEvent(),
			hunterIds,
		});
		return;
	} else if (hunt.status === HuntStatus.Active) {
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
	const hunterIds = await hunterIdsByHunt(huntId);
	const hunt = await db.hunt.findUniqueOrThrow({
		where: {
			id: huntId,
		},
	});

	if (!hunterIds.length || hunt.status === HuntStatus.Complete) {
		return;
	}

	const hunters = await db.hunter.findMany({
		where: { id: { in: hunterIds }, alive: true },
	});

	const perHunterPayment = Math.floor(payment / hunters.length); // Rounding errors to iHunt, inc

	// Save data to hunt and hunt spots
	await db.hunt.update({
		where: {
			id: huntId,
		},
		data: {
			comment,
			payment,
			rating: huntRating,
			status: HuntStatus.Complete,
			completedAt: hunt.completedAt ?? new Date(),
		},
	});

	await db.huntSpot.updateMany({
		where: { huntId, hunterId: { not: null } },
		data: { paid: perHunterPayment },
	});

	// Update and notify the hunters.
	for (const hunter of hunters) {
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
