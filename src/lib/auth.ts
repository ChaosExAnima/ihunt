import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import Discord from 'next-auth/providers/discord';

import { db } from './db';
import { isDev } from './utils';

const providers: Provider[] = [Discord];
const devPassword = process.env.ADMIN_PASSWORD;
if (isDev() && devPassword) {
	providers.push(
		Credentials({
			async authorize({ password }) {
				try {
					console.log(
						'Authorizing with dev password:',
						password !== devPassword ? password : '***',
					);

					if (password !== devPassword) {
						throw new Error('Wrong password');
					}
					let user = await db.user.findFirst({
						where: { id: 'admin' },
					});
					if (!user) {
						user = await db.user.create({
							data: { id: 'admin', name: 'Admin' },
						});
						await db.account.create({
							data: {
								provider: 'credentials',
								providerAccountId: user.id,
								type: 'credentials',
								userId: user.id,
							},
						});
					}
					return user;
				} catch (err) {
					console.error(err);
					return null;
				}
			},
			credentials: {
				password: {
					label: 'Dev Password',
					type: 'password',
				},
			},
			name: 'dev password',
		}),
	);
}

export const { auth, handlers, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(db),
	debug: process.env.NODE_ENV === 'development',
	providers,
	session: {
		strategy: 'jwt',
	},
});
