import { Hunt } from '@prisma/client';
import { db } from './db';

export async function huntToHunters(hunt: Hunt) {
	const huntHunters = await db.huntHunter.findMany({
		select: { hunter: true },
		where: {
			hunt,
		},
	});
	return huntHunters.map((hunt) => hunt.hunter);
}
