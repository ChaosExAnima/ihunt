import { useMemo } from 'react';

import { HUNT_MAX_HUNTERS } from '@/lib/constants';
import { HunterSchema } from '@/lib/schemas';
import { arrayOfLength, cn } from '@/lib/utils';

import Avatar, { AvatarEmpty } from './avatar';

interface HunterListProps {
	className?: string;
	hunters: HunterSchema[];
	isReserved?: boolean;
	max?: number;
}

export function HunterList({
	className,
	hunters,
	isReserved = false,
	max = 0,
}: HunterListProps) {
	const slots = useMemo(
		() => arrayOfLength(Math.min(max, HUNT_MAX_HUNTERS) || hunters.length),
		[hunters.length, max],
	);

	return (
		<ul className={cn('flex gap-2', className)}>
			{slots.map((_, index) => (
				<HunterSlot
					hunter={hunters[index]}
					isReserved={isReserved}
					key={index}
				/>
			))}
		</ul>
	);
}

function HunterSlot({
	hunter,
	isReserved,
}: {
	hunter?: HunterSchema;
	isReserved: boolean;
}) {
	if (!hunter) {
		return (
			<li>
				<AvatarEmpty className={cn(isReserved && 'bg-slate-900')} />
			</li>
		);
	}
	return (
		<li>
			<Avatar hunter={hunter} link />
		</li>
	);
}
