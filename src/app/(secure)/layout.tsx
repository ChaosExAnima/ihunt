import Header from '@/components/header';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { ensureLoggedIn, signOut } from '@/lib/auth';
import { sessionToHunter } from '@/lib/user';
import { cn, isDev } from '@/lib/utils';

export default async function SecureLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	await ensureLoggedIn();
	try {
		const hunter = await sessionToHunter();
		const devMode = isDev();
		return (
			<div
				className={cn(
					'grow flex flex-col w-full justify-stretch',
					devMode && 'border border-stone-400 dark:border-stone-800',
					devMode && 'w-[360px] h-[687px] mx-auto mt-4',
				)}
			>
				<Navbar hunter={hunter} />
				<main className="grow px-4 flex flex-col gap-2 pb-4">
					{children}
				</main>
			</div>
		);
	} catch (err) {
		console.error('Error with session:', err);
	}
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
