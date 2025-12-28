import { useMemo } from 'react';

import { HUNT_MAX_HUNTERS } from '@/lib/constants';
import { HunterSchema } from '@/lib/schemas';
import { arrayOfLength, cn } from '@/lib/utils';

import Avatar, { AvatarEmpty } from './avatar';

interface HunterListProps {
	className?: string;
	emptyClassName?: string;
	hunters: HunterSchema[];
	max?: number;
}

export function HunterList({
	className,
	emptyClassName,
	hunters,
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
					emptyClassName={emptyClassName}
					hunter={hunters[index]}
					key={index}
				/>
			))}
		</ul>
	);
}

function HunterSlot({
	emptyClassName,
	hunter,
}: Pick<HunterListProps, 'emptyClassName'> & {
	hunter?: HunterSchema;
}) {
	if (!hunter) {
		return (
			<li>
				<AvatarEmpty className={emptyClassName} />
			</li>
		);
	}
	return (
		<li>
			<Avatar hunter={hunter} link />
		</li>
	);
}
