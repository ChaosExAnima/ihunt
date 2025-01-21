'use server';

import { cookies } from 'next/headers';

import { db } from './db';

export async function fetchCurrentUser() {
	const id = 1;
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

export async function forceAdmin() {
	if (!(await isAdmin())) {
		throw new Error('Not an admin');
	}
}

export async function isAdmin() {
	const cookieStore = await cookies();
	const cookie = cookieStore.get('admin');
	return cookie?.value === 'yes';
}

export async function logInAs(id: number) {
	console.log(`Logging in as ${id}`);
	const cookieStore = await cookies();
	cookieStore.set('user', id.toString());
}
