import { HuntInvite } from '@prisma/client';

import { HuntStatus } from '@/lib/constants';
import { todayStart } from '@/lib/formats';
import { extractIds, extractKey } from '@/lib/utils';

import { db } from './db';
import { InviteStatus } from './schema';

interface FetchInviteesForHuntArgs {
	fromHunterId: number;
	groupId: number;
	huntId: number;
}

export async function expireInvites(invites: HuntInvite[]) {
	const now = new Date();
	const validInvites: HuntInvite[] = [];
	const expiredInvites: HuntInvite[] = [];
	for (const invite of invites) {
		if (invite.status !== InviteStatus.Pending) {
			continue;
		}
		if (invite.expiresAt >= now) {
			validInvites.push(invite);
		} else {
			expiredInvites.push(invite);
		}
	}

	if (expiredInvites.length > 0) {
		await db.huntInvite.updateMany({
			data: {
				status: InviteStatus.Expired,
			},
			where: {
				id: {
					in: extractIds(expiredInvites),
				},
			},
		});
	}

	return validInvites;
}

export async function fetchDailyHuntCount(hunterId: number) {
	const dateStart = new Date(todayStart());
	const huntCount = await db.hunt.count({
		where: {
			hunters: {
				some: {
					id: hunterId,
				},
			},
			scheduledAt: {
				gte: dateStart,
			},
			status: {
				in: [
					HuntStatus.Active,
					HuntStatus.Available,
					HuntStatus.Complete,
				],
			},
		},
	});
	return huntCount;
}

export async function fetchInviteesForHunt({
	fromHunterId,
	groupId,
	huntId,
}: FetchInviteesForHuntArgs): Promise<number[]> {
	const hunters = await db.hunter.findMany({
		select: {
			id: true,
		},
		where: {
			alive: true,
			groupId,
			hunts: {
				none: {
					id: huntId,
				},
			},
		},
	});

	const oldInvites = await db.huntInvite.findMany({
		select: {
			toHunterId: true,
		},
		where: {
			fromHunterId,
			huntId: huntId,
		},
	});
	const oldInviteHunterIds = extractKey(oldInvites, 'toHunterId');

	const invitees: number[] = [];
	for (const hunter of hunters) {
		if (
			hunter.id === fromHunterId ||
			oldInviteHunterIds.includes(hunter.id)
		) {
			continue;
		}
		invitees.push(hunter.id);
	}

	return invitees;
}

export async function fetchUnclaimedSpots(huntId: number) {
	const hunt = await db.hunt.findUniqueOrThrow({
		include: {
			hunters: {
				select: { id: true },
			},
			invites: {
				where: {
					status: InviteStatus.Pending,
				},
			},
		},
		where: { id: huntId },
	});
	if (hunt.status !== HuntStatus.Available) {
		throw new Error('Hunt is not open');
	}

	const joinedHunterIds = new Set(extractIds(hunt.hunters));
	const invitedHunterIds = new Set(
		extractKey(hunt.invites, 'toHunterId'),
	).difference(joinedHunterIds);

	return {
		hunt,
		invited: invitedHunterIds,
		invitedCount: invitedHunterIds.size,
		joined: joinedHunterIds,
		joinedCount: joinedHunterIds.size,
	};
}
