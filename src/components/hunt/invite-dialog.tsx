import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useInvalidate } from '@/hooks/use-invalidate';
import { trpc } from '@/lib/api';
import { HUNT_INVITE_MINUTES } from '@/lib/constants';
import { HunterSchema } from '@/lib/schemas';

import { Avatar } from '../avatar';
import { ConfirmDialog } from '../confirm-dialog';

interface HuntInviteModalProps {
	huntId: number;
	inviteeIds: number[];
	onClose?: () => void;
}

export function HuntInviteModal({
	huntId,
	inviteeIds,
	onClose,
}: HuntInviteModalProps) {
	const { data: group } = useQuery(trpc.hunter.getGroup.queryOptions());

	const { availableHunters, unavailableHunters } = useMemo(() => {
		const groupHunters = group?.hunters ?? [];
		if (!groupHunters.length || !inviteeIds) {
			return {};
		}

		const availableHunters: HunterSchema[] = [];
		const unavailableHunters: HunterSchema[] = [];
		for (const hunter of groupHunters) {
			if (inviteeIds.includes(hunter.id)) {
				availableHunters.push(hunter);
			} else {
				unavailableHunters.push(hunter);
			}
		}
		return { availableHunters, unavailableHunters };
	}, [inviteeIds, group?.hunters]);

	const invalidate = useInvalidate();
	const { mutate } = useMutation(
		trpc.invite.sendInvites.mutationOptions({
			onSuccess() {
				invalidate([trpc.hunt.getAvailable.queryKey()]);
			},
		}),
	);
	const handleSend = useCallback(() => {
		mutate({ huntId });
		onClose?.();
	}, [huntId, mutate, onClose]);

	if (!availableHunters?.length && !unavailableHunters?.length) {
		return null;
	}

	return (
		<ConfirmDialog
			noDescription
			onCancel={onClose}
			onConfirm={handleSend}
			open
			title="Invite your group"
		>
			<p>Invite the rest of your group?</p>
			<ul className="flex gap-2">
				{availableHunters.map((hunter) => (
					<li key={hunter.id}>
						<Avatar hunter={hunter} />
					</li>
				))}
				{unavailableHunters.map((hunter) => (
					<li className="opacity-50" key={hunter.id}>
						<Avatar hunter={hunter} />
					</li>
				))}
			</ul>
			<p className="text-muted-foreground">
				Your group will have {HUNT_INVITE_MINUTES} minutes to accept or
				decline the hunt.
			</p>
		</ConfirmDialog>
	);
}
