import { HUNTER_LOW_RATING, HUNTER_TOP_MIN_RATING } from '@/lib/constants';

import { db, Hunter, Prisma } from './db';
import {
	notifyHunter,
	notifyHunters,
	hunterDeactivated,
	moneyNegative,
	ratingHigh,
	ratingLow,
} from './notify';

export async function hunterUpdateNotifications(
	hunter: Hunter,
	data: Prisma.HunterUpdateInput,
) {
	const hunterId = hunter.id;
	// Notify group members their friend has died.
	if (hunter.alive && !data.alive && hunter.groupId) {
		const groupHunters = await db.hunter.findMany({
			where: {
				alive: true,
				groupId: hunter.groupId,
				id: {
					not: hunterId,
				},
			},
		});
		await notifyHunters({
			hunters: groupHunters,
			event: hunterDeactivated({
				handle: hunter.handle,
				hunterId,
			}),
		});
	}

	if (hunter.money >= 0 && typeof data.money === 'number' && data.money < 0) {
		await notifyHunter({
			hunterId,
			event: moneyNegative({ money: data.money, hunterId }),
		});
	}

	if (
		hunter.rating < HUNTER_TOP_MIN_RATING &&
		typeof data.rating === 'number' &&
		data.rating >= HUNTER_TOP_MIN_RATING
	) {
		await notifyHunter({
			hunterId,
			event: ratingHigh({ hunterId }),
		});
	}

	if (
		hunter.rating > HUNTER_LOW_RATING &&
		typeof data.rating === 'number' &&
		data.rating <= HUNTER_LOW_RATING
	) {
		await notifyHunter({
			hunterId,
			event: ratingLow({ hunterId }),
		});
	}

	return data;
}

export async function isHunterNPC(hunter: Hunter) {
	if (!hunter.userId) {
		return false;
	}

	const user = await db.user.findUnique({
		where: {
			id: hunter.userId,
		},
	});

	if (!user) {
		return false;
	}
	return isCodeNPC(user.code);
}

export function isCodeNPC(code: string) {
	return (
		code.toLowerCase().startsWith('n') || code.toLowerCase().startsWith('d')
	);
}
