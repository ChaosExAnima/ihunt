'use client';

import { cn } from '@/lib/utils';

import Header from './header';
import { Button } from './ui/button';

interface WelcomeProps {
	className?: string;
	loggingIn: boolean;
	logInAction: () => void;
}

export default function Welcome({
	className,
	loggingIn,
	logInAction,
}: WelcomeProps) {
	return (
		<main className={cn('p-4 flex flex-col gap-4 text-center', className)}>
			<Header>iHunt</Header>
			<Button
				disabled={loggingIn}
				onClick={logInAction}
				size="lg"
				variant="success"
			>
				Log In
			</Button>
		</main>
	);
}
