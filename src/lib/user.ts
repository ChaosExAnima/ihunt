'use server';

import { auth } from './auth';
import { db } from './db';

export async function sessionToHunter() {
	const session = await auth();
	if (!session?.user) {
		throw new Error('Not logged in');
	}

	const user = session.user;
	const hunter = await db.hunter.findFirstOrThrow({
		include: {
			avatar: true,
		},
		where: {
			user,
		},
	});
	return hunter;
}
