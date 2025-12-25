import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { trpc } from '@/lib/api';

import { HunterGroupList } from '../hunter/group-list';
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

	if (isLoadingHunt || !hunt) {
		return null;
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open>
			<DialogHeader>Invite hunters</DialogHeader>
			<DialogContent>
				<HunterGroupList groupId={null}>
					<p>Invite the rest of your group?</p>
				</HunterGroupList>
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
