import { HuntSchema } from '@/lib/schemas';
import { arrayOfLength } from '@/lib/utils';

import Avatar, { AvatarEmpty, AvatarLocked } from '../avatar';

interface HuntHuntersDisplayProps {
	isReserved?: boolean;
}

export function HuntHuntersDisplay({
	hunters = [],
	isReserved = false,
	maxHunters = 0,
}: HuntHuntersDisplayProps &
	Partial<Pick<HuntSchema, 'hunters' | 'maxHunters'>>) {
	const emptySpots = arrayOfLength(maxHunters - hunters.length);
	return (
		<div className="flex gap-2 items-center text-sm">
			<p>Hunters:</p>
			<ul className="flex gap-2">
				{hunters.map((hunter) => (
					<li key={hunter.id}>
						<Avatar hunter={hunter} link />
					</li>
				))}
				{emptySpots.map((index) => (
					<li key={index}>
						{isReserved ? (
							<AvatarLocked className="pl-1" />
						) : (
							<AvatarEmpty />
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
