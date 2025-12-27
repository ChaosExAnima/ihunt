import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

import { trpc } from '@/lib/api';
import { HUNT_INVITE_TIME } from '@/lib/constants';

import { HunterGroupList } from '../hunter/group-list';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface HuntInviteModalProps {
	huntId: number;
	onClose: () => void;
}

export function HuntInviteModal({ huntId, onClose }: HuntInviteModalProps) {
	const { data, isLoading } = useQuery(
		trpc.invite.availableInvitees.queryOptions({ huntId }),
	);
	useEffect(() => {
		if (data?.count === 0) {
			onClose();
		}
	}, [data?.count, onClose]);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				onClose();
			}
		},
		[onClose],
	);

	const { mutate } = useMutation(trpc.invite.sendInvites.mutationOptions());
	const handleSend = useCallback(() => {
		mutate({ huntId });
		onClose();
	}, [huntId, mutate, onClose]);

	if (isLoading || !data?.count) {
		return null;
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open>
			<DialogHeader>
				<DialogTitle>Invite hunters</DialogTitle>
			</DialogHeader>
			<DialogContent>
				<p>Invite the rest of your group?</p>
				<HunterGroupList />
				<p className="text-muted-foreground">
					Your group will have {HUNT_INVITE_TIME} minutes to accept or
					decline the hunt.
				</p>
				<Button className="grow" onClick={handleSend} variant="success">
					Send invites
				</Button>
				<Button onClick={onClose} variant="secondary">
					No thanks
				</Button>
			</DialogContent>
		</Dialog>
	);
}
