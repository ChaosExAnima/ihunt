import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';

import { PASSWORD_CHAR_COUNT, SESSION_COOKIE_NAME } from '@/lib/constants';
import { omit } from '@/lib/utils';

import { config } from './config';
import { db } from './db';
import { userSettingsDatabaseSchema } from './schema';

const { authPepper, authSession } = config;

export type Context = Awaited<ReturnType<typeof createAuthContext>>;

interface SessionData {
	isAdmin?: boolean;
	userId?: number;
}

export const HASH_ITERATIONS = 10;

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
		const { hunters, ...user } = await db.user.findUniqueOrThrow({
			include: {
				hunters: {
					include: {
						avatar: true,
					},
					where: {
						alive: true,
					},
				},
			},
			where: {
				id: session.userId,
			},
		});
		return {
			hunter: hunters.at(0),
			req,
			res,
			session,
			user: {
				...omit(user, 'password', 'settings'),
				settings: userSettingsDatabaseSchema.parse(user.settings),
			},
		};
	} catch (err) {
		req.log.warn(err, `Error logging in user ${session.userId}`);
		session.destroy();
	}
	return { req, res, session };
}

export function getSession({
	req,
	res,
}: Pick<CreateFastifyContextOptions, 'req' | 'res'>) {
	return getIronSession<SessionData>(req.raw, res.raw, {
		cookieName: SESSION_COOKIE_NAME,
		cookieOptions: {
			httpOnly: false,
		},
		password: authSession,
	});
}

export async function passwordToHash(input: string) {
	const fullHash = await bcrypt.hash(input, authPepper);
	return fullHash.slice(authPepper.length);
}

export function stringToPassword(input: string) {
	return input
		.toLowerCase()
		.replaceAll(/[^a-z0-9]+/g, '')
		.slice(0, PASSWORD_CHAR_COUNT);
}
