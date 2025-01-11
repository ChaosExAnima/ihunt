'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { db } from './db';

export async function fetchCurrentUser() {
	const cookieStore = await cookies();
	const cookie = cookieStore.get('user');
	if (!cookie) {
		redirect('/');
	}
	const id = Number.parseInt(cookie.value);
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
