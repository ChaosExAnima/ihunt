import { HuntStatus } from '@/lib/constants';
import { todayStart } from '@/lib/formats';
import { extractIds } from '@/lib/utils';

import { db, Hunt, Hunter, HuntHunter } from './db';
import { inviteResponseEvent, notifyUser } from './notify';
import { InviteStatus } from './schema';

export async function expireInvites(invites: HuntHunter[]) {
	const now = new Date();
	const validInvites: HuntHunter[] = [];
	for (const invite of invites) {
		if (
			!invite.expiresAt ||
			(invite.expiresAt >= now && invite.status !== InviteStatus.Expired)
		) {
			validInvites.push(invite);
		}
	}

	await db.huntHunter.updateMany({
		data: {
			status: InviteStatus.Expired,
		},
		where: {
			expiresAt: {
				gte: now,
			},
			status: InviteStatus.Pending,
		},
	});

	return validInvites;
}

export async function fetchDailyHuntCount(hunterId: number) {
	const dateStart = new Date(todayStart());
	const huntCount = await db.hunt.count({
		where: {
			huntHunters: {
				some: {
					hunterId,
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
}: {
	fromHunterId: number;
	groupId: number;
	huntId: number;
}) {
	// Get the hunters in the group.
	const hunters = await db.hunter.findMany({
		where: {
			alive: true,
			groupId,
			userId: {
				not: null,
			},
		},
	});

	// Find existing invites that are rejected or expired.
	const oldInvites = await db.huntHunter.findMany({
		select: {
			hunterId: true,
			status: true,
		},
		where: {
			huntId,
			hunterId: {
				in: extractIds(hunters),
			},
		},
	});

	const invitees: Hunter[] = [];
	for (const hunter of hunters) {
		// Don't invite the inviting hunter.
		if (hunter.id === fromHunterId) {
			continue;
		}

		// Don't invite people who rejected it already.
		const oldInvite = oldInvites.find(
			({ hunterId }) => hunterId === hunter.id,
		);
		if (oldInvite?.status === InviteStatus.Rejected) {
			continue;
		}

		invitees.push(hunter);
	}

	return invitees;
}

export async function onInviteInterval() {
	await db.huntHunter.updateMany({
		data: {
			status: InviteStatus.Expired,
		},
		where: {
			expiresAt: {
				gte: new Date(),
			},
			status: InviteStatus.Pending,
		},
	});
}

export async function respondToInvite({
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
	const status =
		response === 'accept' ? InviteStatus.Accepted : InviteStatus.Rejected;
	const invite = await db.huntHunter.upsert({
		create: {
			huntId,
			hunterId: currentHunter.id,
			status,
		},
		update: {
			status,
		},
		where: {
			huntId_hunterId: {
				huntId,
				hunterId: currentHunter.id,
			},
		},
	});

	if (!invite.fromHunterId) {
		return false;
	}

	const inviter = await db.hunter.findUniqueOrThrow({
		where: {
			id: invite.fromHunterId,
		},
	});

	if (!inviter.userId) {
		return false;
	}

	return notifyUser({
		event: inviteResponseEvent({
			fromHunter: inviter,
			hunt,
			response,
		}),
		userId: inviter.userId,
	});
}
