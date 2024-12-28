'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function acceptHunt(id: number) {
	console.log(`Accepted hunt with ID ${id}`);
}

export async function logInAs(id: number) {
	console.log(`Logging in as ${id}`);
	const cookieStore = await cookies();
	cookieStore.set('user', id.toString());
	redirect('/hunts');
}
