import {
	HUNT_MAX_PER_DAY,
	HUNTER_LOCKDOWN_MINUTES,
	HuntStatus,
} from '@ihunt/lib/constants';
import { MINUTE, todayStart } from '@ihunt/lib/formats';
import { TRPCError } from '@trpc/server';

import { db, Hunter } from './db';
import { huntInLockdown } from './hunt';
import { inviteSendEvent, notifyHunter } from './notify';
import { inviteHuntersToSpots, spotsByHunter } from './spot';

export async function hunterCanHunt(hunterId: number) {
	const spots = await spotsByHunter(hunterId, todayStart());

	if (spots.length === 0) {
		return true;
	}

	if (spots.length >= HUNT_MAX_PER_DAY) {
		return false;
	}

	const lastUpdated = spots[0]?.updatedAt.getTime();
	if (lastUpdated + HUNTER_LOCKDOWN_MINUTES * MINUTE < Date.now()) {
		return false;
	}

	return true;
}

export async function inviteHunters(
	huntId: number,
	hunterIds: number[],
	fromHunter: Hunter,
) {
	// Prevent creating invites when hunt is locked down or unavailable.
	const hunt = await db.hunt.findUniqueOrThrow({
		where: { id: huntId },
	});
	if (hunt.status !== HuntStatus.Available || huntInLockdown(hunt)) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'Hunt cannot have invites',
		});
	}

	const spots = await inviteHuntersToSpots(huntId, hunterIds, fromHunter.id);
	if (!spots.length) {
		throw new TRPCError({
			code: 'NOT_FOUND',
			message: 'Nobody left to invite today',
		});
	}

	const event = inviteSendEvent({
		fromHunter,
		hunt,
	});
	for (const spot of spots) {
		if (!spot.hunterId) {
			continue;
		}
		await notifyHunter({
			event,
			hunterId: spot.hunterId,
		});
	}

	return spots;
}
