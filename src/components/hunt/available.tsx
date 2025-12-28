import { useMutation, useQuery } from '@tanstack/react-query';
import { CircleCheckBig, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useHunterId } from '@/hooks/use-hunter';
import { useInvalidate } from '@/hooks/use-invalidate';
import { trpc } from '@/lib/api';
import { HUNT_MAX_PER_DAY } from '@/lib/constants';
import { MINUTE, SECOND } from '@/lib/formats';
import { HuntSchema } from '@/lib/schemas';

import { HuntDisplayProps } from '.';
import { Button } from '../ui/button';
import HuntBase from './base';

export function HuntDisplayAvailable(props: HuntDisplayProps) {
	const { hunt, onAcceptHunt } = props;

	const { hunters = [], id: huntId, maxHunters, reserved } = hunt;

	const currentHunterId = useHunterId();
	const hasAccepted = useMemo(
		() => (hunters ?? []).some((hunter) => hunter.id === currentHunterId),
		[hunters, currentHunterId],
	);
	const handleAccept = useCallback(() => {
		onAcceptHunt?.(huntId);
	}, [huntId, onAcceptHunt]);

	const { data: huntsToday = 0 } = useQuery(
		trpc.hunt.getHuntsToday.queryOptions(),
	);

	const remainingHunts = HUNT_MAX_PER_DAY - huntsToday;
	const canJoinHunt =
		remainingHunts > 0 &&
		maxHunters - hunters.length > 0 &&
		reserved?.status !== 'reserved';

	return (
		<HuntBase {...props}>
			{!hasAccepted && <HuntInvite reserved={reserved} />}

			<div className="flex gap-2 justify-center">
				{!hasAccepted && canJoinHunt && (
					<Button
						className="rounded-full font-bold"
						onClick={handleAccept}
						variant="success"
					>
						<CircleCheckBig
							aria-label="Accept hunt"
							strokeWidth="3"
						/>
						Accept
					</Button>
				)}
				{hasAccepted && (
					<Button
						className="rounded-full font-bold"
						onClick={handleAccept}
						variant="destructive"
					>
						<X />
						Leave hunt
					</Button>
				)}
				{reserved?.status === 'invited' && !hasAccepted && (
					<HuntInviteRejectButton huntId={huntId} />
				)}
			</div>

			{(canJoinHunt || remainingHunts === 0) && !hasAccepted && (
				<p className="text-center text-sm">
					You have {remainingHunts || 'no'} hunts left today.
					<br />
					<strong className="text-green-500">
						Buy iHunt Premium to unlock more!
					</strong>
				</p>
			)}
		</HuntBase>
	);
}

function HuntInvite({ reserved }: Pick<HuntSchema, 'reserved'>) {
	const expiresTs = reserved?.expires.getTime();
	const [minutesLeft, setMinutesLeft] = useState(() =>
		expiresTs ? Math.ceil((expiresTs - Date.now()) / MINUTE) : 0,
	);

	useEffect(() => {
		const id = setInterval(() => {
			if (expiresTs) {
				setMinutesLeft(Math.ceil((expiresTs - Date.now()) / MINUTE));
			}
		}, 10 * SECOND);

		return () => clearInterval(id);
	}, [expiresTs]);

	if (!reserved || minutesLeft <= 0) {
		return null;
	}

	if (reserved.status === 'invited') {
		return (
			<p className="text-center">
				Your group invited you to join this hunt!
				<br />
				You have {minutesLeft} minutes left to accept or decline.
			</p>
		);
	}

	return (
		<p className="text-center">
			This hunt is reserved by another group.
			<br />
			The reservation will expire in {minutesLeft} minutes.
		</p>
	);
}

function HuntInviteRejectButton({ huntId }: { huntId: number }) {
	const invalidate = useInvalidate();
	const { mutate: rejectInvite } = useMutation(
		trpc.invite.rejectInvite.mutationOptions({
			onSuccess() {
				invalidate([trpc.hunt.getAvailable.queryKey()]);
			},
		}),
	);
	const handleReject = useCallback(() => {
		rejectInvite({ huntId });
	}, [huntId, rejectInvite]);
	return (
		<Button
			className="rounded-full font-bold"
			onClick={handleReject}
			variant="destructive"
		>
			<X />
			Decline
		</Button>
	);
}
