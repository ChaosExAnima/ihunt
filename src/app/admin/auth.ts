import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface AdminSessionState {
	loggedIn?: boolean;
}

export async function getSession() {
	if (!process.env.AUTH_SECRET) {
		throw new Error('No AUTH_SECRET');
	}
	const session = await getIronSession<AdminSessionState>(await cookies(), {
		cookieName: 'admin-session',
		password: process.env.AUTH_SECRET,
	});
	return session;
}
