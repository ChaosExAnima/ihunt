import type { PropsWithClassName } from '@/lib/types';

import { HuntStatus } from '@/lib/constants';
import { HuntSchema } from '@/lib/schemas';

import { HuntDisplayActive } from './active';
import { HuntDisplayAvailable } from './available';
import { HuntDisplayCompleted } from './completed';

export { HuntDisplayActive } from './active';

export interface HuntDisplayProps {
	hunt: HuntSchema;
	onAcceptHunt?: (id: number) => void;
	remainingHunts?: number;
}

export function HuntDisplay(props: PropsWithClassName<HuntDisplayProps>) {
	const { hunt } = props;

	switch (hunt.status) {
		case HuntStatus.Active:
			return <HuntDisplayActive hunt={hunt} />;
		case HuntStatus.Available:
			return <HuntDisplayAvailable {...props} />;
		case HuntStatus.Complete:
			return <HuntDisplayCompleted hunt={hunt} />;
		default:
			return null;
	}
}
