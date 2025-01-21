import { redirect } from 'next/navigation';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { auth, signIn } from '@/lib/auth';
import { cn, isDev } from '@/lib/utils';

export default async function Home() {
	const devMode = isDev();
	const session = await auth();

	if (session) {
		redirect('/hunts');
	}
	return (
		<main
			className={cn(
				'p-4 flex flex-col gap-4 text-center',
				devMode && 'border border-stone-400 dark:border-stone-800',
				devMode && 'w-full sm:w-[360px] min-h-[687px] mx-auto mt-4',
			)}
		>
			<Header>iHunt</Header>
			<form
				action={async () => {
					'use server';
					await signIn('credentials', { redirectTo: '/hunts' });
				}}
			>
				<Button size="lg" variant="success">
					Sign in
				</Button>
			</form>
		</main>
	);
}
