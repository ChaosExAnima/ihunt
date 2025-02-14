'use client';

import { type ProviderName } from '@/lib/auth';
import { cn } from '@/lib/utils';

import Header from './header';
import { Button } from './ui/button';

interface WelcomeProps {
	devMode?: boolean;
	logInAction: (method?: ProviderName) => Promise<void>;
}

export default function Welcome({
	devMode = false,
	logInAction,
}: WelcomeProps) {
	return (
		<main
			className={cn(
				'p-4 flex flex-col gap-4 text-center',
				devMode && 'border border-stone-400 dark:border-stone-800',
				devMode && 'w-full sm:w-[360px] min-h-[687px] mx-auto mt-4',
			)}
		>
			<Header>iHunt</Header>
			<Button onClick={() => logInAction()} size="lg" variant="success">
				Log In
			</Button>
		</main>
	);
}
