import { Hunt, Hunter } from '@prisma/client';

import { HuntStatus } from '@/lib/constants';
import { clamp } from '@/lib/utils';

import { db } from './db';

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
	hunters: Pick<Hunter, 'id' | 'rating'>[];
}) {
	// Early checks to ensure we're good.
	const { payment, rating: huntRating } = hunt;
	if (
		hunt.paidHunters ||
		hunt.status === HuntStatus.Complete ||
		payment <= 0 ||
		!huntRating ||
		hunters.length === 0
	) {
		return null;
	}

	const perHunterPayment = Math.floor(payment / hunters.length); // Rounding errors to iHunt, inc

	// Update the hunters.
	const updatedHunters = await Promise.allSettled(
		hunters.map((hunter) => {
			const newRating = calculateNewRating({
				hunterRating: hunter.rating,
				huntRating: huntRating,
			});
			return db.hunter.update({
				data: {
					money: {
						increment: perHunterPayment,
					},
					rating: {
						set: newRating,
					},
				},
				select: {
					id: true,
					money: true,
					rating: true,
				},
				where: { id: hunter.id },
			});
		}),
	);

	// Mark as paid so we don't do it again.
	await db.hunt.update({
		data: {
			paidHunters: true,
		},
		where: { id: hunt.id },
	});

	return {
		hunters: updatedHunters,
		paymentPerHunter: perHunterPayment,
		totalPayment: hunt.payment,
	};
}
