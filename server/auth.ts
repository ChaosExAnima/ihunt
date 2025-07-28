import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { getIronSession } from 'iron-session';

import { config } from './config';
import { db } from './db';

const { authSecret } = config;

export type Context = Awaited<ReturnType<typeof createAuthContext>>;

interface SessionData {
	isAdmin?: boolean;
	userId?: string;
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
	const user = await db.user.findFirstOrThrow({
		where: {
			id: session.userId,
		},
	});
	const hunter = await db.hunter.findFirst({
		include: {
			avatar: true,
		},
		where: {
			user: {
				id: user.id,
			},
		},
	});
	return { hunter, req, res, session, user };
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
