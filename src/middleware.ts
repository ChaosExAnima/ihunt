import { getIronSession } from 'iron-session';
import { MiddlewareConfig, NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import appConfig from '@/lib/config';

import { type AdminSessionState } from './app/admin/actions';

export default auth(async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	if (pathname.startsWith('/admin')) {
		const response = NextResponse.next();
		const session = await getIronSession<AdminSessionState>(
			request,
			response,
			{
				cookieName: 'admin-session',
				password: appConfig().authSecret,
			},
		);
		if (!session.loggedIn) {
			const target = request.nextUrl.clone();
			target.pathname = '/admin/login';
			return NextResponse.redirect(target);
		}
		return response;
	}
});

export const config: MiddlewareConfig = {
	matcher: [
		'/(admin)',
		'/(admin/api/.+)',
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};
