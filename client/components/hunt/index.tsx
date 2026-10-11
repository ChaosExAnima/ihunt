import { HuntStatus } from '@ihunt/lib/constants';
import { HuntSchema } from '@ihunt/lib/schemas';

import type { PropsWithClassName } from '@/lib/types';

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
	switch (props.hunt.status) {
		case HuntStatus.Active:
			return <HuntDisplayActive {...props} />;
		case HuntStatus.Available:
			return <HuntDisplayAvailable {...props} />;
		case HuntStatus.Complete:
		case HuntStatus.Reviewing:
			return <HuntDisplayCompleted {...props} />;
		default:
			return null;
	}
}
