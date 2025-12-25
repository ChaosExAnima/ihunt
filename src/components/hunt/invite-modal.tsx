import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

import { trpc } from '@/lib/api';

import { HunterList } from '../hunter-list';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog';

interface HuntInviteModalProps {
	huntId: number;
	onClose: () => void;
}

export function HuntInviteModal({ huntId, onClose }: HuntInviteModalProps) {
	const { data: hunt, isLoading: isLoadingHunt } = useQuery(
		trpc.hunt.getOne.queryOptions({ huntId }),
	);
	const { data: group } = useQuery(trpc.hunter.getGroup.queryOptions());

	useEffect(() => {
		if (group?.hunters && group.hunters.length === 0) {
			onClose();
		}
	}, [group?.hunters, onClose]);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				onClose();
			}
		},
		[onClose],
	);

	const handleSend = useCallback(() => {
		onClose();
	}, [onClose]);

	if (isLoadingHunt || !hunt || !group?.hunters) {
		return null;
	}

	const groupHunters = group.hunters;

	return (
		<Dialog onOpenChange={handleOpenChange} open>
			<DialogHeader>Invite hunters</DialogHeader>
			<DialogContent>
				{groupHunters.length > 0 && (
					<>
						<p>Invite the rest of your group?</p>
						<HunterList hunters={groupHunters} />
					</>
				)}
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
