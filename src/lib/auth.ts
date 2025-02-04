import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import { Provider } from 'next-auth/providers';
import Discord from 'next-auth/providers/discord';
import NodeEmailer from 'next-auth/providers/nodemailer';

import { db } from './db';
import { isDev } from './utils';

const providers: Provider[] = [Discord];
if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
	providers.push(
		NodeEmailer({
			from: process.env.EMAIL_FROM,
			name: 'email',
			server: process.env.EMAIL_SERVER,
		}),
	);
}

export const { auth, handlers, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(db),
	debug: isDev(),
	providers,
});
