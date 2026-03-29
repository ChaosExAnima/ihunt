import { db, Hunter, Prisma } from './db';
import {
	notifyHunter,
	notifyHunters,
	hunterDeactivated,
	moneyNegative,
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
			}),
		});
	}

	if (hunter.money >= 0 && typeof data.money === 'number' && data.money < 0) {
		await notifyHunter({
			hunterId,
			event: moneyNegative({ money: data.money }),
		});
	}

	return data;
}
