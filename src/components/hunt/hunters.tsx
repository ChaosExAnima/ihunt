import { HuntSchema } from '@/lib/schemas';

import HunterList from '../hunter-list';
import { HuntProps } from './index';

interface HuntHuntersDisplayProps {
	isAccepted?: boolean;
}

export default function HuntHuntersDisplay({
	hunterId,
	hunters,
	maxHunters,
}: HuntHuntersDisplayProps &
	Pick<HuntProps, 'hunterId'> &
	Pick<HuntSchema, 'hunters' | 'maxHunters'>) {
	return (
		<div className="flex gap-2 items-center text-sm">
			<p>Hunters:</p>
			<HunterList
				currentHunterId={hunterId}
				hunters={hunters ?? []}
				max={maxHunters}
			/>
		</div>
	);
}
