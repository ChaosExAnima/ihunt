import { PrismaAdapter } from '@auth/prisma-adapter';

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
