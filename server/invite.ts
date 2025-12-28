import { HUNT_MAX_PER_DAY, HuntStatus } from '@/lib/constants';
import { todayStart } from '@/lib/formats';
import { extractIds, extractKey } from '@/lib/utils';

import { db } from './db';
import { InviteStatus } from './schema';

interface FetchInviteesForHuntArgs {
	fromHunterId: number;
	hunterIds: number[];
	huntId: number;
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
				in: [HuntStatus.Active, HuntStatus.Available],
			},
		},
	});
	return huntCount;
}

export async function fetchInviteesForHunt({
	fromHunterId,
	hunterIds,
	huntId,
}: FetchInviteesForHuntArgs): Promise<number[]> {
	const dateStart = new Date(todayStart());
	const hunters = await db.hunter.findMany({
		select: {
			_count: {
				select: {
					hunts: {
						where: {
							scheduledAt: {
								gte: dateStart,
							},
							status: {
								in: [HuntStatus.Active, HuntStatus.Available],
							},
						},
					},
				},
			},
			id: true,
		},
		where: {
			alive: true,
			hunts: {
				none: {
					id: huntId,
				},
			},
			id: {
				in: hunterIds,
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
			hunter._count.hunts >= HUNT_MAX_PER_DAY ||
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
