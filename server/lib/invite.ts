import { HuntStatus } from '@/lib/constants';
import { todayStart } from '@/lib/formats';
import { HuntReservedSchema, HuntReservedStatusSchema } from '@/lib/schemas';
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
				lt: now,
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
					status: InviteStatus.Accepted,
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

export function invitesToReserved({
	invites,
	hunterId,
}: {
	invites: HuntHunter[];
	hunterId: number;
}) {
	const huntReservedMap = new Map<number, HuntReservedSchema>();
	for (const invite of invites) {
		if (
			!invite.expiresAt ||
			invite.status === InviteStatus.Expired ||
			invite.status === InviteStatus.Accepted
		) {
			continue;
		}
		const mapData = huntReservedMap.get(invite.huntId);
		let status: HuntReservedStatusSchema = mapData?.status ?? 'reserved';

		if (invite.fromHunterId === hunterId) {
			status = 'sent';
		} else if (invite.hunterId === hunterId && status !== 'sent') {
			status =
				invite.status === InviteStatus.Rejected
					? 'declined'
					: 'invited';
		} else if (
			invite.status !== InviteStatus.Pending &&
			status === 'reserved'
		) {
			continue;
		}

		huntReservedMap.set(invite.huntId, {
			expires: invite.expiresAt,
			status,
		});
	}
	return huntReservedMap;
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

		const oldInvite = oldInvites.find(
			({ hunterId }) => hunterId === hunter.id,
		);
		if (
			oldInvite?.fromHunterId ||
			oldInvite?.status === InviteStatus.Accepted
		) {
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
				lt: new Date(),
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
			fromHunter: currentHunter,
			hunt,
			response,
		}),
		userId: inviter.userId,
	});
}
