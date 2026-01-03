import { onlineManager } from '@tanstack/react-query';
import { LoaderCircleIcon, WifiOffIcon } from 'lucide-react';
import { ReactNode } from 'react';

import { BackButton } from './back-button';

interface LoadingProps {
	loadingMsg?: ReactNode;
}

const className = 'flex flex-col gap-2 items-center justify-center grow';
export function Loading({ loadingMsg = 'Loading…' }: LoadingProps) {
	const isOnline = onlineManager.isOnline();

	if (!isOnline) {
		return (
			<div className={className}>
				<WifiOffIcon className="size-1/4" />
				<p className="text-xl">You are offline</p>
				<p className="text-center max-w-3/4 text-muted">
					Try again when you have internet.
				</p>

				<BackButton />
			</div>
		);
	}
	return (
		<div className={className}>
			<LoaderCircleIcon className="animate-spin size-1/4" />
			<p className="text-xl">{loadingMsg}</p>
		</div>
	);
}
