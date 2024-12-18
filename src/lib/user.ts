import { db } from './db';

export async function fetchCurrentUser() {
	const user = await db.hunter.findFirstOrThrow({
		where: {
			id: 1,
		},
	});
	return user;
}
