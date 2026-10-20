import { HUNT_MAX_HUNTERS, SpotStatus } from '@ihunt/lib/constants';

import { cn } from '@/lib/styles';
import { PropsWithClassName } from '@/lib/types';

import { Card } from '../ui/card';
import { HuntSpotsDisplay } from './hunters';

const emptySpots = Array(HUNT_MAX_HUNTERS).map(() => ({
	state: SpotStatus.Empty,
}));

export function HuntLoading({ className }: PropsWithClassName) {
	return (
		<Card className={cn(className, 'flex flex-col gap-2')}>
			<div className="relative overflow-hidden rounded-lg">
				<div className="bg-border aspect-square w-full animate-pulse" />
			</div>
			<div className="flex items-center gap-2 text-sm">
				<p>Hunters:</p>
				<HuntSpotsDisplay spots={emptySpots} />
			</div>
			<div className="flex flex-col gap-1">
				<p className="bg-border h-4 grow animate-pulse" />
				<p className="bg-border h-4 grow animate-pulse" />
				<p className="bg-border h-4 grow animate-pulse" />
			</div>
		</Card>
	);
}
