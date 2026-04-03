import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { getIronSession } from 'iron-session';

import { SESSION_COOKIE_NAME } from '@/lib/constants';
import { HunterTypeSchema } from '@/lib/schemas';
import { isDev, omit } from '@/lib/utils';

import { config } from './config';
import { db } from './db';
import { userSettingsDatabaseSchema } from './schema';

const { authSession } = config;

export type Context = Awaited<ReturnType<typeof createAuthContext>>;

interface SessionData {
	isAdmin?: boolean;
	userId?: number;
}

export const HASH_ITERATIONS = 10;
export const ADMIN_SESSION_NAME = 'ihunt-admin';

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
		isLan: false,
	};

	// Check LAN, with hard-coded HTTPS as proxy isn't SSL.
	if (`https://${req.hostname}` === config.lanHost) {
		context.isLan = true;
	}

	const adminSession = await getAdminSession({ req, res });
	if (adminSession.admin) {
		context.admin = true;

		if (config.adminHunterId && !session.userId) {
			const hunter = await db.hunter.findUniqueOrThrow({
				include: {
					avatar: true,
				},
				where: {
					id: config.adminHunterId,
				},
			});
			return {
				...context,
				hunter,
				user: {
					id: null,
					code: null,
					settings: {
						hideMoney: false,
						notifications: {},
					},
				},
			};
		}
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
				...omit(user, 'settings'),
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
			secure: !isDev(),
		},
		password: authSession,
	});
}

export function getAdminSession({
	req,
	res,
}: Pick<CreateFastifyContextOptions, 'req' | 'res'>) {
	return getIronSession<{ admin?: boolean }>(req.raw, res.raw, {
		cookieName: ADMIN_SESSION_NAME,
		cookieOptions: {
			domain: config.cookieDomain,
			httpOnly: true,
			secure: !isDev(),
		},
		password: authSession,
	});
}

export function hunterTypeToAccessLetter(type: HunterTypeSchema) {
	return type.charAt(0).replace('6', 's'); // use S instead of the number 6.
}

export function hunterToAccessCode(type: HunterTypeSchema, index: number) {
	return hunterTypeToAccessLetter(type) + index.toString().padStart(2, '0');
}

export async function calculateNextAccessCode(type: HunterTypeSchema) {
	const typeLetter = hunterTypeToAccessLetter(type);
	const codes = await db.user.findMany({
		where: {
			code: {
				startsWith: typeLetter,
			},
		},
	});
	const newIndex = codes.reduce((index, { code }) => {
		if (!code) {
			return index;
		}

		const newIndex = Number.parseInt(code.slice(1));
		if (newIndex && Number.isFinite(newIndex)) {
			return newIndex + 1;
		}
		return index;
	}, 0);

	return typeLetter + newIndex.toString().padStart(2, '0');
}
