import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

import { HuntInviteModal } from '@/components/hunt/invite-dialog';
import { trpc } from '@/lib/api';
import { HUNT_MAX_PER_DAY } from '@/lib/constants';

import { useInvalidate } from './use-invalidate';

export function useAvailableHunt() {
	const invalidate = useInvalidate();
	const { mutateAsync } = useMutation(
		trpc.hunt.join.mutationOptions({
			onSuccess() {
				invalidate([
					trpc.hunt.getAvailable.queryKey(),
					trpc.hunt.getHuntsToday.queryKey(),
					trpc.invite.pathKey(),
				]);
			},
		}),
	);

	const { data: acceptedToday = 0 } = useQuery(
		trpc.hunt.getHuntsToday.queryOptions(),
	);

	const [acceptedHunt, setAcceptedHunt] = useState<{
		huntId: number;
		inviteeIds: number[];
	} | null>(null);

	const handleAcceptHunt = useCallback(
		(huntId: number) => {
			void mutateAsync({ huntId }).then(({ invitees = [] }) => {
				if (invitees.length) {
					setAcceptedHunt({
						huntId,
						inviteeIds: invitees,
					});
				}
			});
		},
		[mutateAsync],
	);

	const handleCloseInviteModal = useCallback(() => {
		setAcceptedHunt(null);
	}, []);

	const modal = acceptedHunt ? (
		<HuntInviteModal
			huntId={acceptedHunt.huntId}
			inviteeIds={acceptedHunt.inviteeIds}
			onClose={handleCloseInviteModal}
		/>
	) : null;

	return {
		acceptedToday,
		remainingToday: HUNT_MAX_PER_DAY - acceptedToday,
		onJoin: handleAcceptHunt,
		inviteModal: modal,
	};
}
