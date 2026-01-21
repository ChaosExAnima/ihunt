import { HuntStatus } from '@/lib/constants';
import { todayStart } from '@/lib/formats';
import { HuntReservedSchema, HuntReservedStatusSchema } from '@/lib/schemas';
import { extractIds, extractKey } from '@/lib/utils';

import { db, Hunt, Hunter, HuntInvite, Prisma } from './db';
import { inviteResponseEvent, notifyUser } from './notify';
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
		if (invite.expiresAt >= now && invite.status !== InviteStatus.Expired) {
			validInvites.push(invite);
		} else if (invite.status === InviteStatus.Pending) {
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
			huntId,
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
					status: {
						in: [InviteStatus.Pending, InviteStatus.Accepted],
					},
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

export async function reservationsFromHunts(
	hunts: Prisma.HuntGetPayload<{ include: { invites: true } }>[],
	currentHunterId: number,
) {
	const invites = await expireInvites(
		hunts.flatMap(({ invites }) => invites),
	);
	const invitedHuntMap = new Map<number, HuntReservedSchema>();
	for (const invite of invites) {
		const mapData = invitedHuntMap.get(invite.huntId);
		let status: HuntReservedStatusSchema = mapData?.status ?? 'reserved';

		if (invite.fromHunterId === currentHunterId) {
			status = 'sent';
		} else if (invite.toHunterId === currentHunterId && status !== 'sent') {
			status =
				invite.status === InviteStatus.Rejected
					? 'declined'
					: 'invited';
		}

		if (status) {
			invitedHuntMap.set(invite.huntId, {
				expires: invite.expiresAt,
				status,
			});
		}
	}
	return invitedHuntMap;
}

export async function respondToInvites({
	currentHunter,
	hunt,
	huntId,
	response,
}: {
	currentHunter: Hunter;
	hunt?: Hunt;
	huntId: number;
	response: 'accept' | 'decline';
}) {
	hunt ??= await db.hunt.findUniqueOrThrow({
		where: {
			id: huntId,
		},
	});
	const invites = await db.huntInvite.findMany({
		include: {
			fromHunter: true,
		},
		where: {
			huntId,
			status: {
				in: [InviteStatus.Pending, InviteStatus.Accepted],
			},
			toHunterId: currentHunter.id,
		},
	});

	if (invites.length === 0) {
		return 0;
	}

	await db.huntInvite.updateMany({
		data: {
			status:
				response === 'accept'
					? InviteStatus.Accepted
					: InviteStatus.Rejected,
		},
		where: {
			id: {
				in: extractIds(invites),
			},
		},
	});

	let notified = 0;
	for (const invite of invites) {
		const userId = invite.fromHunter.userId;
		if (!userId) {
			continue;
		}
		const result = await notifyUser({
			event: inviteResponseEvent({
				fromHunter: currentHunter,
				hunt,
				response,
			}),
			userId,
		});
		if (result) {
			notified++;
		}
	}
	return notified;
}
