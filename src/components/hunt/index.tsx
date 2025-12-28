import { CircleCheckBig } from 'lucide-react';

import type { PropsWithClassName } from '@/lib/types';

import { HuntStatus } from '@/lib/constants';
import { useCurrencyFormat } from '@/lib/formats';
import { HuntSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

import { HuntDisplayActive } from './active';
import { HuntDisplayAvailable } from './available';
import HuntBase from './base';

export { HuntDisplayActive } from './active';

export interface HuntDisplayProps {
	hunt: HuntSchema;
	onAcceptHunt?: (id: number) => void;
	remainingHunts?: number;
}

export function HuntDisplay(props: PropsWithClassName<HuntDisplayProps>) {
	const { hunt } = props;
	const payment = useCurrencyFormat(hunt.payment);

	switch (hunt.status) {
		case HuntStatus.Active:
			return <HuntDisplayActive hunt={hunt} />;
		case HuntStatus.Available:
			return <HuntDisplayAvailable {...props} />;
		case HuntStatus.Complete:
			return (
				<HuntBase {...props}>
					{payment && <p>You earned {payment}!</p>}
					<div
						className={cn(
							'flex my-4 gap-2 items-center justify-center font-semibold self-center',
							'text-green-500',
						)}
					>
						<CircleCheckBig
							aria-label="Completed Hunt"
							className="size-4 shrink-0"
							strokeWidth="3"
						/>
						Complete!
					</div>
				</HuntBase>
			);
		default:
			return null;
	}
}
