import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { getIronSession } from 'iron-session';

import { config } from './config';
import { db } from './db';

const { authSecret } = config;

export type Context = Awaited<ReturnType<typeof createAuthContext>>;

interface SessionData {
	isAdmin?: boolean;
	userId?: number;
}

export async function createAuthContext({
	req,
	res,
}: CreateFastifyContextOptions) {
	const session = await getSession({ req, res });

	if (session.isAdmin) {
		return { admin: true, req, res, session };
	}

	if (!session.userId) {
		return { req, res, session };
	}
	try {
		const { hunter, ...user } = await db.user.findFirstOrThrow({
			include: {
				hunter: {
					include: {
						avatar: true,
					},
				},
			},
			where: {
				id: session.userId,
			},
		});
		return { hunter, req, res, session, user };
	} catch (err) {
		console.warn(`Error logging in user ${session.userId}:`, err);
		session.destroy();
	}
	return { req, res, session };
}

export function getSession({
	req,
	res,
}: Pick<CreateFastifyContextOptions, 'req' | 'res'>) {
	return getIronSession<SessionData>(req.raw, res.raw, {
		cookieName: 'ihunt-session',
		password: authSecret,
	});
}
