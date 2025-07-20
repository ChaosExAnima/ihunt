import { useMemo } from 'react';

import { HunterSchema } from '@/lib/schemas';

import Avatar, { AvatarEmpty } from './avatar';

interface HunterListProps {
	currentHunterId?: number;
	hunters: HunterSchema[];
	max?: number;
}

const MAX_HUNTERS = 4;

export default function HunterList({
	currentHunterId,
	hunters,
	max = 0,
}: HunterListProps) {
	const slots = useMemo(
		() => Array.from(Array(Math.min(max, MAX_HUNTERS))),
		[max],
	);

	return (
		<ul className="flex gap-2">
			{slots.map((_, index) => (
				<HunterSlot
					currentHunterId={currentHunterId}
					hunter={hunters[index]}
					key={index}
				/>
			))}
		</ul>
	);
}

function HunterSlot({
	currentHunterId,
	hunter,
}: {
	currentHunterId?: number;
	hunter?: HunterSchema;
}) {
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
				href={
					hunter.id === currentHunterId
						? '/settings'
						: `/hunters/${hunter.id}`
				}
			>
				<Avatar hunter={hunter} />
			</Link>
		</li>
	);
}
