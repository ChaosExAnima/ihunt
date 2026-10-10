import { HuntStatus } from '@/lib/constants';
import { huntCompleteEvent } from '@/server/lib/notify';
import { InviteStatus } from '@/server/lib/schema';

import { db } from '../server';

async function main() {
	const huntHunters = await db.huntHunter.findMany({
		where: {
			status: InviteStatus.Accepted,
			hunt: {
				status: HuntStatus.Complete,
				completedAt: {
					not: null,
				},
			},
		},
		include: {
			hunt: true,
		},
	});

	const notifications = await db.notification.findMany({
		where: {
			type: 'hunt-complete',
		},
	});

	for (const huntHunter of huntHunters) {
		const hasNotification = notifications.find(
			({ hunterId }) => hunterId === huntHunter.hunterId,
		);
		if (!hasNotification) {
			await db.notification.create({
				data: {
					hunterId: huntHunter.hunterId,
					type: 'hunt-complete',
					event: huntCompleteEvent({ hunt: huntHunter.hunt }),
				},
			});
		}
	}
}

main()
	.then(() => process.exit())
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
