'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface LogInState {
	success?: boolean;
}

export async function logIn(
	prevState: LogInState,
	formData: FormData,
): Promise<LogInState> {
	const password = formData.get('password');
	if (password === process.env.ADMIN_PASSWORD) {
		const cookieStore = await cookies();
		cookieStore.set('admin', 'yes');
		throw redirect('/admin/hunts');
	}

	return {
		success: false,
	};
}
