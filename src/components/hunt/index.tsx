import { useQuery } from '@tanstack/react-query';
import { CircleCheckBig, X } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import type { PropsWithClassName } from '@/lib/types';

import { useHunterId } from '@/hooks/use-hunter';
import { trpc } from '@/lib/api';
import { HUNT_MAX_PER_DAY, HuntStatus } from '@/lib/constants';
import { useCurrencyFormat } from '@/lib/formats';
import { HuntSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { HuntDisplayActive } from './active';
import HuntBase from './base';

export { HuntDisplayActive } from './active';

export interface HuntDisplayProps {
	hunt: HuntSchema;
	onAcceptHunt?: (id: number) => void;
	remainingHunts?: number;
}

export function HuntDisplay(props: PropsWithClassName<HuntDisplayProps>) {
	const { hunt, onAcceptHunt } = props;
	const hunterId = useHunterId();
	const isAccepted = useMemo(
		() => (hunt.hunters ?? []).some((hunter) => hunter.id === hunterId),
		[hunt.hunters, hunterId],
	);
	const { data: huntsToday = 0 } = useQuery(
		trpc.hunt.getHuntsToday.queryOptions(),
	);
	const remainingHunts = HUNT_MAX_PER_DAY - huntsToday;

	const handleAccept = useCallback(() => {
		onAcceptHunt?.(hunt.id);
	}, [hunt.id, onAcceptHunt]);

	const payment = useCurrencyFormat(hunt.payment);
	const huntersLeft =
		hunt.hunters && hunt.maxHunters - hunt.hunters.length > 0;

	switch (hunt.status) {
		case HuntStatus.Active:
			return <HuntDisplayActive hunt={hunt} />;
		case HuntStatus.Available:
			return (
				<HuntBase {...props}>
					{huntersLeft && !isAccepted && (
						<p className="text-center text-sm">
							You have {remainingHunts || 'no'} hunts left today.
							<br />
							<strong className="text-green-500">
								Buy iHunt Premium to unlock more!
							</strong>
						</p>
					)}
					<Button
						className="flex mx-auto rounded-full font-bold self-center"
						disabled={!huntersLeft && !isAccepted}
						onClick={handleAccept}
						variant={isAccepted ? 'destructive' : 'success'}
					>
						{isAccepted ? (
							<X />
						) : (
							<CircleCheckBig
								aria-label="Accept hunt"
								strokeWidth="3"
							/>
						)}
						{isAccepted ? 'Cancel' : 'Accept'}
					</Button>
				</HuntBase>
			);
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
