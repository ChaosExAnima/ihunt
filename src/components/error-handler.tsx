import { ErrorComponentProps } from '@tanstack/react-router';
import { CircleAlertIcon } from 'lucide-react';
import { useEffect } from 'react';

import { BackButton } from './back-button';
import { Button } from './ui/button';

export function ErrorHandler({ error, reset }: ErrorComponentProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);
	return (
		<div className="flex flex-col gap-2 items-center justify-center grow">
			<CircleAlertIcon className="size-1/4" />
			<p className="text-xl">There is an error</p>
			<p className="text-center max-w-3/4 text-muted-foreground">
				Try again, or contact support if you keep experiencing the
				issue.
			</p>
			<Button onClick={reset}>Try again</Button>
			<BackButton />
		</div>
	);
}
