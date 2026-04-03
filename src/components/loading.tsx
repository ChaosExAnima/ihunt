import { onlineManager } from '@tanstack/react-query';
import { LoaderCircleIcon } from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '@/lib/styles';
import { PropsWithClassName } from '@/lib/types';

import { ErrorOffline } from './error-handler';

export function Loading({
	className,
	loadingMsg = 'Loading…',
}: PropsWithClassName<{
	loadingMsg?: ReactNode;
}>) {
	const isOnline = onlineManager.isOnline();

	const fullClassName = cn(
		'flex grow flex-col items-center justify-center gap-2',
		className,
	);

	if (!isOnline) {
		return <ErrorOffline className={fullClassName} />;
	}
	return (
		<div className={fullClassName}>
			<LoaderCircleIcon className="size-1/4 animate-spin" />
			<p className="text-xl">{loadingMsg}</p>
		</div>
	);
}
