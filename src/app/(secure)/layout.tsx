import Header from '@/components/header';
import Navbar from '@/components/navbar';
import {
	PlayerSettings,
	PlayerSettingsProvider,
} from '@/components/providers/player';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { ensureLoggedIn, signOut } from '@/lib/auth';
import { sessionToHunter, sessionToUser } from '@/lib/user';
import { cn, isDev } from '@/lib/utils';

export default async function SecureLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	await ensureLoggedIn();
	try {
		const user = await sessionToUser();
		const hunter = await sessionToHunter();
		const devMode = isDev();

		const settings: PlayerSettings = {
			hideMoney: user.hideMoney,
			hunter,
			loggedIn: true,
		};

		return (
			<div
				className={cn(
					'grow flex flex-col w-full justify-stretch',
					devMode && 'border border-stone-400 dark:border-stone-800',
					devMode && 'w-[360px] min-h-[687px] mx-auto mt-4',
				)}
			>
				<PlayerSettingsProvider settings={settings}>
					<Navbar hunter={hunter} />
					<main className="grow px-4 flex flex-col gap-2 pb-4">
						{children}
					</main>
					<Toaster />
				</PlayerSettingsProvider>
			</div>
		);
	} catch (err) {
		console.error('Error with session:', err);
	}
	return <NoHunter />;
}

function NoHunter() {
	return (
		<main className="p-4 flex flex-col gap-4 text-center max-w-(--breakpoint-sm) mx-auto">
			<Header level={1}>No hunter</Header>
			<p>You do not have a hunter assigned yet.</p>
			<Button
				onClick={async () => {
					'use server';
					await signOut({ redirectTo: '/' });
				}}
				variant="secondary"
			>
				Log out
			</Button>
		</main>
	);
}
