import { redirect } from 'next/navigation';

import Welcome from '@/components/welcome';
import { auth, signIn } from '@/lib/auth';
import { isDev } from '@/lib/utils';

export default async function Home() {
	const session = await auth();

	if (session) {
		redirect('/hunts');
	}
	return (
		<Welcome
			devMode={isDev()}
			logInAction={async () => {
				'use server';
				await signIn('discord', {
					redirectTo: '/hunts',
				});
			}}
		/>
	);
}
