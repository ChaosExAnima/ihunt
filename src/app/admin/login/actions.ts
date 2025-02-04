'use server';

import { redirect } from 'next/navigation';

import { getSession } from '../auth';

export interface LogInState {
	success?: boolean;
}

export async function logIn(
	prevState: LogInState,
	formData: FormData,
): Promise<LogInState> {
	if (!process.env.AUTH_SECRET) {
		return {
			success: false,
		};
	}
	const password = formData.get('password');
	if (password !== process.env.ADMIN_PASSWORD) {
		return {
			success: false,
		};
	}
	try {
		const session = await getSession();
		session.loggedIn = true;
		await session.save();
	} catch (err) {
		console.error(err);
		return {
			success: false,
		};
	}
	throw redirect('/admin');
}

export async function logOut() {
	try {
		const session = await getSession();
		await session.destroy();
	} catch (err) {
		console.error(err);
	}
	throw redirect('/admin/login');
}
