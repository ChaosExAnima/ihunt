import { HuntSchema } from '@/lib/schemas';

import { HunterList } from '../hunter-list';

interface HuntHuntersDisplayProps {
	isAccepted?: boolean;
}

export function HuntHuntersDisplay({
	hunters,
	maxHunters,
}: HuntHuntersDisplayProps & Pick<HuntSchema, 'hunters' | 'maxHunters'>) {
	return (
		<div className="flex gap-2 items-center text-sm">
			<p>Hunters:</p>
			<HunterList hunters={hunters ?? []} max={maxHunters} />
		</div>
	);
}
