import { useMutation, useQuery } from '@tanstack/react-query';
import { CircleCheckBig, X } from 'lucide-react';
import { useCallback, useId, useMemo, useState } from 'react';

import { useHunterId } from '@/hooks/use-hunter';
import { useInterval } from '@/hooks/use-interval';
import { useInvalidate } from '@/hooks/use-invalidate';
import { trpc } from '@/lib/api';
import {
	HUNT_LOCKDOWN_MINUTES,
	HUNT_MAX_DANGER,
	HUNT_MAX_PER_DAY,
} from '@/lib/constants';
import { MINUTE, SECOND } from '@/lib/formats';
import { HuntSchema } from '@/lib/schemas';

import { HuntDisplayProps } from '.';
import { ConfirmDialog, ConfirmDialogProps } from '../confirm-dialog';
import { Button } from '../ui/button';
import { HuntBase } from './base';

export function HuntDisplayAvailable(props: HuntDisplayProps) {
	const { hunt, onAcceptHunt } = props;

	const { danger, hunters = [], id: huntId, maxHunters, reserved } = hunt;

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
		reserved?.status !== 'reserved' &&
		reserved?.status !== 'declined';

	const isLockedDown = useLockedDown(hunt.scheduledAt);

	return (
		<HuntBase {...props}>
			<HuntInvite noHunts={remainingHunts === 0} reserved={reserved} />

			<div className="flex gap-2 justify-center">
				{!hasAccepted && canJoinHunt && (
					<HuntJoinButton
						danger={danger}
						isLockedDown={isLockedDown}
						onAccept={handleAccept}
					/>
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

function checkHuntTime(ts?: number) {
	return !!ts && ts > Date.now() - HUNT_LOCKDOWN_MINUTES * MINUTE;
}

function HuntInvite({
	noHunts,
	reserved,
}: Pick<HuntSchema, 'reserved'> & { noHunts: boolean }) {
	const expiresTs = reserved?.expires.getTime();
	const [minutesLeft, setMinutesLeft] = useState(() =>
		expiresTs ? Math.ceil((expiresTs - Date.now()) / MINUTE) : 0,
	);

	const handleInterval = useCallback(() => {
		if (expiresTs) {
			setMinutesLeft(Math.ceil((expiresTs - Date.now()) / MINUTE));
		}
	}, [expiresTs]);
	useInterval({ cb: handleInterval, interval: 10 * SECOND });

	if (!reserved || minutesLeft <= 0) {
		return null;
	}

	if (reserved.status === 'invited') {
		return (
			<p className="text-center">
				Your group invited you to join this hunt!
				<br />
				{!noHunts
					? `You have ${minutesLeft} minutes left to accept or decline.`
					: `You must leave other hunts within ${minutesLeft} minutes to accept.`}
			</p>
		);
	} else if (reserved.status === 'sent') {
		return (
			<p className="text-center">
				You have invited your group.
				<br />
				They have {minutesLeft} minutes left to accept or decline.
			</p>
		);
	} else if (reserved.status === 'declined') {
		return (
			<p className="text-center">
				You have rejected the invitation.
				<br />
				You can join in {minutesLeft} minutes.
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

function HuntJoinButton({
	danger,
	isLockedDown,
	onAccept,
}: {
	danger: number;
	isLockedDown?: boolean;
	onAccept: () => void;
}) {
	const [accepted, setAccepted] = useState(false);

	const handleAccept = useCallback(() => {
		if (danger === HUNT_MAX_DANGER && isLockedDown && !accepted) {
			setAccepted(true);
		} else {
			onAccept();
		}
	}, [danger, isLockedDown, accepted, onAccept]);

	const id = useId();
	const dialogProps = useMemo(
		() =>
			({
				id,
				onConfirm: handleAccept,
				trigger: (
					<Button
						aria-controls={id}
						className="rounded-full font-bold"
						variant="success"
					>
						<CircleCheckBig
							aria-label="Accept hunt"
							strokeWidth="3"
						/>
						Accept
					</Button>
				),
			}) satisfies ConfirmDialogProps,
		[handleAccept, id],
	);

	if (isLockedDown && !accepted) {
		return (
			<ConfirmDialog {...dialogProps} title="Confirm joining hunt">
				Because this hunt is happening soon, once you accept this hunt
				you <strong>cannot</strong> cancel.
			</ConfirmDialog>
		);
	}

	if (danger === HUNT_MAX_DANGER) {
		return (
			<ConfirmDialog
				{...dialogProps}
				isDangerous
				title="Confirm maximum danger"
			>
				<p>
					This hunt is marked at the{' '}
					<strong>highest danger rating</strong>.
					<br />
					Please confirm you understand and accept the risks.
				</p>
				<p className="text-muted text-sm mt-4">
					By accepting this hunt, you agree that iHunt is not liable
					nor is able to provide support for any events which occur as
					a result of accepting this contract, including but not
					limited to: injury, maiming, death, murder, property damage,
					theft, breaking and entering, and grave desecration. You
					also understand that if this hunt is not completed iHunt may
					at their discretion terminate your account for inactivity.
				</p>
			</ConfirmDialog>
		);
	}

	return (
		<Button
			className="rounded-full font-bold"
			onClick={handleAccept}
			variant="success"
		>
			<CircleCheckBig aria-label="Accept hunt" strokeWidth="3" />
			Accept
		</Button>
	);
}

function useLockedDown(scheduledAt: Date | null) {
	const scheduledTs = scheduledAt?.getTime();
	const [isLockedDown, setIsLockedDown] = useState(() =>
		checkHuntTime(scheduledTs),
	);

	const handleInterval = useCallback(() => {
		if (!isLockedDown && checkHuntTime(scheduledTs)) {
			setIsLockedDown(true);
		}
	}, [scheduledTs, isLockedDown]);
	useInterval({ cb: handleInterval });

	return isLockedDown;
}
