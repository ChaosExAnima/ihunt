'use client';

import { type ProviderName } from '@/lib/auth';
import { cn } from '@/lib/utils';

import Header from './header';
import { Button } from './ui/button';

interface WelcomeProps {
	className?: string;
	logInAction: (method?: ProviderName) => Promise<void>;
}

export default function Welcome({ className, logInAction }: WelcomeProps) {
	return (
		<main className={cn('p-4 flex flex-col gap-4 text-center', className)}>
			<Header>iHunt</Header>
			<Button onClick={() => logInAction()} size="lg" variant="success">
				Log In
			</Button>
		</main>
	);
}
