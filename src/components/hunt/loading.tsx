import { HUNT_MAX_HUNTERS } from '@/lib/constants';
import { PropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Card } from '../ui/card';
import { HuntHuntersDisplay } from './hunters';

export function HuntLoading({ className }: PropsWithClassName) {
	return (
		<Card className={cn(className, 'flex flex-col gap-2')}>
			<div className="relative rounded-lg overflow-hidden">
				<div className="bg-border animate-pulse aspect-square w-full" />
			</div>
			<div className="flex gap-2 items-center text-sm">
				<p>Hunters:</p>
				<HuntHuntersDisplay maxHunters={HUNT_MAX_HUNTERS} />
			</div>
			<div className="flex flex-col gap-1">
				<p className="bg-border grow animate-pulse h-4" />
				<p className="bg-border grow animate-pulse h-4" />
				<p className="bg-border grow animate-pulse h-4" />
			</div>
		</Card>
	);
}
