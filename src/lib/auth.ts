import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import { Provider } from 'next-auth/providers';
import Discord from 'next-auth/providers/discord';
import NodeEmailer from 'next-auth/providers/nodemailer';

import config from './config';
import { db } from './db';
import { isDev } from './utils';

const { authSecret, discordId, discordSecret, emailFrom, emailServer } =
	config();

const providers: Provider[] = [
	Discord({
		clientId: discordId,
		clientSecret: discordSecret,
	}),
];
if (emailFrom && emailServer) {
	providers.push(
		NodeEmailer({
			from: emailFrom,
			name: 'email',
			server: emailServer,
		}),
	);
}

export const { auth, handlers, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(db),
	debug: isDev(),
	providers,
	secret: authSecret,
});
