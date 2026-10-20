import {
	HUNT_LOCKDOWN_MINUTES,
	HUNT_MAX_PER_DAY,
	SpotStatus,
} from '@ihunt/lib/constants';
import { MINUTE, todayStart } from '@ihunt/lib/formats';
import { extractIds } from '@ihunt/lib/utils';
import { FastifyBaseLogger } from 'fastify';

import { db, Hunt, Prisma } from './db';

export async function spotsByHunt(huntId: number) {
	return db.huntSpot.findMany({
		where: { huntId },
		orderBy: { id: 'asc' },
	});
}

export async function emptySpotsByHunt(huntId: number) {
	const spots = await spotsByHunt(huntId);
	return spots.filter(
		(spot) => spot.status === SpotStatus.Empty && !spot.hunterId,
	);
}

export async function hunterIdsByHunt(huntId: number) {
	const spots = await spotsByHunt(huntId);
	const hunterIds = spots
		.map(({ hunterId }) => hunterId)
		.filter((hunterId): hunterId is number => !!hunterId);

	return hunterIds;
}

export async function spotByHunter(hunterId: number, huntId?: number) {
	const spot = await db.huntSpot.findFirst({
		where: { huntId, hunterId },
	});
	return spot;
}

export async function dailyHuntCount(
	hunterId: number,
	date = new Date(todayStart()),
) {
	const spots = await db.huntSpot.findMany({
		where: { hunterId, updatedAt: { gte: date } },
	});
	const uniqueHuntIds = new Set<number>();
	for (const spot of spots) {
		uniqueHuntIds.add(spot.huntId);
	}
	return uniqueHuntIds.size;
}

export async function hunterIdsToInvite(huntId: number, hunterIds: number[]) {
	const spots = await spotsByHunt(huntId);
	const huntersToCheck = new Set(hunterIds);
	let spotsAvailable = 0;
	for (const spot of spots) {
		if (spot.hunterId) {
			huntersToCheck.delete(spot.hunterId);
		} else if (spot.status === SpotStatus.Empty) {
			spotsAvailable++;
		}
	}

	if (spotsAvailable === 0 || huntersToCheck.size === 0) {
		return [];
	}

	const huntersToInvite = [];
	for (const hunterId of huntersToCheck) {
		const huntsToday = await dailyHuntCount(hunterId);
		if (huntsToday < HUNT_MAX_PER_DAY) {
			huntersToInvite.push(hunterId);
			if (huntersToInvite.length >= spotsAvailable) {
				break;
			}
		}
	}

	return huntersToInvite;
}

export async function syncSpotsForHunt(hunt: Hunt, logger?: FastifyBaseLogger) {
	const huntId = hunt.id;
	const existingSpots = await spotsByHunt(huntId);
	const spotCount = hunt.maxHunters;

	if (existingSpots.length === spotCount) {
		// Exit if we match already.
		logger?.info(`Spots for hunt ${hunt.id} are in sync`);
		return;
	} else if (existingSpots.length > spotCount) {
		// Prune all spots above the limit.
		const spotsToDelete = existingSpots.slice(spotCount);
		const result = await db.huntSpot.deleteMany({
			where: {
				id: {
					in: extractIds(spotsToDelete),
				},
			},
		});
		logger?.info(`Pruned ${result.count} spots for hunt ${hunt.id}`);
	} else if (existingSpots.length < spotCount) {
		const spotCountMissing = spotCount - existingSpots.length;
		const result = await db.huntSpot.createMany({
			data: Array(spotCountMissing).fill({
				huntId,
			} satisfies Prisma.HuntSpotCreateManyInput),
		});
		logger?.info(`Added ${result.count} spots for hunt ${hunt.id}`);
	}
}

export async function inviteHuntersToSpots(
	huntId: number,
	hunterIds: number[],
	fromHunterId?: number,
) {
	const huntersToInvite = await hunterIdsToInvite(huntId, hunterIds);
	if (!huntersToInvite.length) {
		return [];
	}

	const spots = await emptySpotsByHunt(huntId);

	if (!spots.length) {
		return [];
	}

	const claimedSpots = [];
	for (const spot of spots) {
		const hunterId = hunterIds.pop();
		if (!hunterId) {
			break;
		}
		claimedSpots.push(
			await db.huntSpot.update({
				where: { id: spot.id },
				data: { status: SpotStatus.Locked, hunterId, fromHunterId },
			}),
		);
	}

	return claimedSpots;
}

export async function onSpotInterval(logger?: FastifyBaseLogger) {
	const unlocked = await unlockHuntSpots();
	if (unlocked > 0) {
		logger?.info(`Unlocked ${unlocked.toString()} hunt spots`);
	}
}

export async function unlockHuntSpots() {
	const before = new Date(Date.now() - HUNT_LOCKDOWN_MINUTES * MINUTE);
	const updated = await db.huntSpot.updateMany({
		where: {
			status: SpotStatus.Locked,
			hunterId: { not: null },
			updatedAt: { lte: before },
		},
		data: { status: SpotStatus.Empty, hunterId: null, fromHunterId: null },
	});
	return updated.count;
}

export async function claimHuntSpot(huntId: number, hunterId: number) {
	const spots = await spotsByHunt(huntId);

	// Find the spot for the hunter.
	let foundSpotId = null;
	for (const spot of spots) {
		if (spot.hunterId === hunterId) {
			// Exit if the spot was already claimed.
			if (spot.status === SpotStatus.Taken) {
				return spot;
			}
			foundSpotId = spot.id;
			break;
		} else if (!spot.hunterId) {
			foundSpotId = spot.id;
			break;
		}
	}

	if (!foundSpotId) {
		return null;
	}

	const result = await db.huntSpot.update({
		where: { id: foundSpotId },
		data: { hunterId, status: SpotStatus.Taken },
	});
	return result;
}

export async function clearHuntSpot(id: number) {
	await db.huntSpot.update({
		where: { id },
		data: { status: SpotStatus.Empty, hunterId: null },
	});
}
