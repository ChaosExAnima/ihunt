'use server';

import { cookies } from 'next/headers';

import { db } from './db';

export async function fetchCurrentUser() {
	const cookieStore = await cookies();
	let id = 1;
	const cookie = cookieStore.get('user');
	if (cookie) {
		id = Number.parseInt(cookie.value);
	}
	const user = await db.hunter.findFirstOrThrow({
		where: {
			id,
		},
	});
	return user;
}
