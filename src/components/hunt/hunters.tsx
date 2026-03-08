import { HuntSchema } from '@/lib/schemas';
import { arrayOfLength } from '@/lib/utils';

import { Avatar, AvatarEmpty, AvatarLocked } from '../avatar';

interface HuntHuntersDisplayProps {
	reservations?: number;
}

export function HuntHuntersDisplay({
	hunters = [],
	reservations = 0,
	maxHunters = 0,
}: HuntHuntersDisplayProps &
	Partial<Pick<HuntSchema, 'hunters' | 'maxHunters'>>) {
	const reservedSpots = arrayOfLength(reservations);
	const emptySpots = arrayOfLength(
		maxHunters - (hunters.length + reservations),
	);
	return (
		<div className="flex items-center gap-2 text-sm">
			<p>Hunters:</p>
			<ul className="flex gap-2">
				{hunters.map((hunter) => (
					<li key={hunter.id}>
						<Avatar hunter={hunter} link />
					</li>
				))}
				{reservedSpots.map((index) => (
					<li key={index}>
						<AvatarLocked className="pl-1" />
					</li>
				))}
				{emptySpots.map((index) => (
					<li key={index}>
						<AvatarEmpty />
					</li>
				))}
			</ul>
		</div>
	);
}
