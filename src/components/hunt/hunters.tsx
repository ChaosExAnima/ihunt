import HunterList from '../hunter-list';
import { HuntModel } from './consts';
import { HuntProps } from './index';

interface HuntHuntersDisplayProps {
	isAccepted?: boolean;
}

export default function HuntHuntersDisplay({
	hunterId,
	hunters,
	maxHunters,
}: HuntHuntersDisplayProps &
	Pick<HuntModel, 'hunters' | 'maxHunters'> &
	Pick<HuntProps, 'hunterId'>) {
	return (
		<div className="flex gap-4 mb-4 items-center">
			<p>Hunters:</p>
			<HunterList
				currentHunterId={hunterId}
				hunters={hunters}
				max={maxHunters}
			/>
		</div>
	);
}
