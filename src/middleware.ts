import { getIronSession } from 'iron-session';
import { NextRequest, NextResponse } from 'next/server';

import type { AdminSessionState } from './app/admin/auth';

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
		if (!process.env.AUTH_SECRET) {
			return NextResponse.json(
				{
					message: 'Server misconfigured',
					success: false,
				},
				{ status: 500 },
			);
		}
		const response = NextResponse.next();
		const session = await getIronSession<AdminSessionState>(
			request,
			response,
			{
				cookieName: 'admin-session',
				password: process.env.AUTH_SECRET,
			},
		);
		if (!session.loggedIn) {
			const target = request.nextUrl.clone();
			target.pathname = '/admin/login';
			return NextResponse.redirect(target);
		}
		return response;
	}
}
