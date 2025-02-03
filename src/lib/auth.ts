import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import Discord from 'next-auth/providers/discord';
import NodeEmailer from 'next-auth/providers/nodemailer';

import { db } from './db';
import { isDev } from './utils';

export const { auth, handlers, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(db),
	debug: isDev(),
	providers: [
		Discord,
		NodeEmailer({
			from: process.env.EMAIL_FROM,
			name: 'email',
			server: process.env.EMAIL_SERVER,
		}),
	],
});
