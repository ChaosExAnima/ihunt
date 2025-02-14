import 'server-only';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import { Provider } from 'next-auth/providers';
import Discord from 'next-auth/providers/discord';
import NodeEmailer from 'next-auth/providers/nodemailer';
import { redirect } from 'next/navigation';

import config from './config';
import { db } from './db';

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

export type ProviderName = 'discord' | 'email';

export const { auth, handlers, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(db),
	callbacks: {
		async authorized({ auth }) {
			return auth !== null;
		},
	},
	providers,
	secret: authSecret,
});

export async function ensureLoggedIn() {
	const session = await auth();
	if (!session) {
		redirect('/');
	}
}
