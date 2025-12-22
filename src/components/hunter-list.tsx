import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';

import { useHunterId } from '@/hooks/use-hunter';
import { HUNT_MAX_HUNTERS } from '@/lib/constants';
import { HunterSchema } from '@/lib/schemas';

import Avatar, { AvatarEmpty } from './avatar';

interface HunterListProps {
	hunters: HunterSchema[];
	max?: number;
}

export function HunterList({ hunters, max = 0 }: HunterListProps) {
	const slots = useMemo(
		() => Array.from(Array(Math.min(max, HUNT_MAX_HUNTERS))),
		[max],
	);

	return (
		<ul className="flex gap-2">
			{slots.map((_, index) => (
				<HunterSlot hunter={hunters[index]} key={index} />
			))}
		</ul>
	);
}

function HunterSlot({ hunter }: { hunter?: HunterSchema }) {
	const currentHunterId = useHunterId();
	if (!hunter) {
		return (
			<li>
				<AvatarEmpty />
			</li>
		);
	}
	return (
		<li>
			<Link
				params={{ hunterId: hunter.id }}
				to={
					hunter.id === currentHunterId
						? '/settings'
						: '/hunters/$hunterId'
				}
			>
				<Avatar hunter={hunter} />
			</Link>
		</li>
	);
}
