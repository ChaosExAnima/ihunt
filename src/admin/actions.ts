'use server';

import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import config from '@/lib/config';

export interface AdminSessionState {
	loggedIn?: boolean;
}

export interface LogInState {
	success?: boolean;
}

const { adminPassword, authSecret } = config();

export async function getAdminSession() {
	const session = await getIronSession<AdminSessionState>(await cookies(), {
		cookieName: 'admin-session',
		password: authSecret,
	});
	return session;
}

export async function logIn(
	prevState: LogInState,
	formData: FormData,
): Promise<LogInState> {
	const password = formData.get('password');
	if (password !== adminPassword) {
		return {
			success: false,
		};
	}
	try {
		const session = await getAdminSession();
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
		const session = await getAdminSession();
		await session.destroy();
	} catch (err) {
		console.error(err);
	}
	redirect('/admin/login');
}
