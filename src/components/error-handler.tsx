import { ErrorComponentProps } from '@tanstack/react-router';
import { CircleAlertIcon, WifiOffIcon } from 'lucide-react';
import { useEffect } from 'react';

import { PropsWithClassName } from '@/lib/types';

import { BackButton } from './back-button';
import { Button } from './ui/button';

const className = 'flex flex-col gap-2 items-center justify-center grow';

export function ErrorHandler({ error, reset }: ErrorComponentProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	if (
		error instanceof TypeError &&
		error.message.startsWith('Failed to fetch dynamically imported module')
	) {
		return <ErrorOffline className={className} />;
	}

	return (
		<div className={className}>
			<CircleAlertIcon className="size-1/4" />
			<p className="text-xl">There is an error</p>
			<p className="text-muted max-w-3/4 text-center">
				Try again, or contact support if you keep experiencing the
				issue.
			</p>
			<Button onClick={reset}>Try again</Button>
			<BackButton />
		</div>
	);
}

export function ErrorOffline({ className }: PropsWithClassName) {
	return (
		<div className={className}>
			<WifiOffIcon className="size-1/4" />
			<p className="text-xl">You are offline</p>
			<p className="text-muted max-w-3/4 text-center">
				Try again when you have internet.
			</p>

			<BackButton />
		</div>
	);
}
