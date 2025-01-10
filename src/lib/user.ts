'use server';

import { cookies } from 'next/headers';

import { db } from './db';
import { redirect } from 'next/navigation';

export async function fetchCurrentUser() {
	const cookieStore = await cookies();
	let id = 1;
	const cookie = cookieStore.get('user');
	if (cookie) {
		id = Number.parseInt(cookie.value);
	}
	const user = await db.hunter.findFirstOrThrow({
		include: {
			avatar: true,
		},
		where: {
			id,
		},
	});
	return user;
}
export async function logInAs(id: number) {
	console.log(`Logging in as ${id}`);
	const cookieStore = await cookies();
	cookieStore.set('user', id.toString());
	redirect('/hunts');
}
