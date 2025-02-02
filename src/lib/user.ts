'use server';

import { cookies } from 'next/headers';

import { auth } from './auth';
import { db } from './db';

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
