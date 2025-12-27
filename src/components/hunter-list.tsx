import { useMemo } from 'react';

import { HUNT_MAX_HUNTERS } from '@/lib/constants';
import { HunterSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

import Avatar, { AvatarEmpty } from './avatar';

interface HunterListProps {
	className?: string;
	hunters: HunterSchema[];
	max?: number;
}

export function HunterList({ className, hunters, max = 0 }: HunterListProps) {
	const slots = useMemo(
		() =>
			Array.from(
				Array(Math.min(max, HUNT_MAX_HUNTERS) || hunters.length),
			),
		[hunters.length, max],
	);

	return (
		<ul className={cn('flex gap-2', className)}>
			{slots.map((_, index) => (
				<HunterSlot hunter={hunters[index]} key={index} />
			))}
		</ul>
	);
}

function HunterSlot({ hunter }: { hunter?: HunterSchema }) {
	if (!hunter) {
		return (
			<li>
				<AvatarEmpty />
			</li>
		);
	}
	return (
		<li>
			<Avatar hunter={hunter} link />
		</li>
	);
}
