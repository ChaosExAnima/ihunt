import { useQuery } from '@tanstack/react-query';
import { CircleCheckBig, X } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { useHunterId } from '@/hooks/use-hunter';
import { trpc } from '@/lib/api';
import { HUNT_MAX_PER_DAY } from '@/lib/constants';

import { HuntDisplayProps } from '.';
import { Button } from '../ui/button';
import HuntBase from './base';

export function HuntDisplayAvailable(props: HuntDisplayProps) {
	const { hunt, onAcceptHunt } = props;
	const hunterId = useHunterId();

	const isAccepted = useMemo(
		() => (hunt.hunters ?? []).some((hunter) => hunter.id === hunterId),
		[hunt.hunters, hunterId],
	);
	const handleAccept = useCallback(() => {
		onAcceptHunt?.(hunt.id);
	}, [hunt.id, onAcceptHunt]);

	const { data: huntsToday = 0 } = useQuery(
		trpc.hunt.getHuntsToday.queryOptions(),
	);

	const remainingHunts = HUNT_MAX_PER_DAY - huntsToday;
	const huntersLeft =
		hunt.hunters && hunt.maxHunters - hunt.hunters.length > 0;

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
					<CircleCheckBig aria-label="Accept hunt" strokeWidth="3" />
				)}
				{isAccepted ? 'Cancel' : 'Accept'}
			</Button>
		</HuntBase>
	);
}
