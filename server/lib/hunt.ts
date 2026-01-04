import { Hunt, Hunter } from '@prisma/client';

import { HuntStatus } from '@/lib/constants';
import { clamp } from '@/lib/utils';

import { db } from './db';
import { huntCompleteEvent, notifyUser } from './notify';

export function calculateNewRating({
	hunterRating,
	huntRating,
}: {
	hunterRating: number;
	huntRating: number;
}): number {
	// Take the average of the hunter and hunt rating, and clamp it from 0-5.
	return clamp({ input: (huntRating + hunterRating) / 2, max: 5 });
}

export async function completeHunt({
	hunt,
	hunters,
}: {
	hunt: Hunt;
	hunters: Hunter[];
}) {
	// Early checks to ensure we're good.
	const { payment, rating: huntRating } = hunt;
	if (
		hunt.paidHunters ||
		hunt.status !== HuntStatus.Complete ||
		payment <= 0 ||
		!huntRating ||
		hunters.length === 0
	) {
		return null;
	}

	const aliveHunters = hunters.filter((hunter) => hunter.alive);

	const perHunterPayment = Math.floor(payment / aliveHunters.length); // Rounding errors to iHunt, inc

	// Update and notify the hunters.
	for (const hunter of aliveHunters) {
		const newRating = calculateNewRating({
			hunterRating: hunter.rating,
			huntRating: huntRating,
		});
		await db.hunter.update({
			data: {
				money: {
					increment: perHunterPayment,
				},
				rating: {
					set: newRating,
				},
			},
			where: { id: hunter.id },
		});
		if (hunter.userId) {
			await notifyUser({
				event: huntCompleteEvent({ hunt }),
				userId: hunter.userId,
			});
		}
	}

	// Mark as paid so we don't do it again.
	await db.hunt.update({
		data: {
			paidHunters: true,
		},
		where: { id: hunt.id },
	});

	return {
		paymentPerHunter: perHunterPayment,
		totalPayment: hunt.payment,
	};
}
