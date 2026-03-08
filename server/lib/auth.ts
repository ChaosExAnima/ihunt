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

	const context = {
		req,
		res,
		session,
		admin: false,
		hunter: null,
		user: null,
	};

	if (session.isAdmin) {
		context.admin = true;
	}

	if (!session.userId) {
		return context;
	}
	try {
		const { hunter, ...user } = await db.user.findUniqueOrThrow({
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
		return {
			...context,
			hunter,
			user: {
				...omit(user, 'password', 'settings'),
				settings: userSettingsDatabaseSchema.parse(user.settings),
			},
		};
	} catch (err) {
		req.log.warn(err, `Error logging in user ${session.userId}`);
		session.destroy();
	}
	return context;
}

export function getSession({
	req,
	res,
}: Pick<CreateFastifyContextOptions, 'req' | 'res'>) {
	return getIronSession<SessionData>(req.raw, res.raw, {
		cookieName: SESSION_COOKIE_NAME,
		cookieOptions: {
			domain: config.cookieDomain,
			httpOnly: false,
			sameSite: 'none',
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

export function handleToHash(handle: string) {
	const input = stringToPassword(handle);
	if (input.length !== PASSWORD_CHAR_COUNT) {
		throw Error('Invalid password length');
	}
	return passwordToHash(input);
}
