import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { useInvalidate } from '@/hooks/use-invalidate';
import { trpc } from '@/lib/api';
import { HUNT_INVITE_MINUTES } from '@/lib/constants';
import { HunterSchema } from '@/lib/schemas';

import { Avatar } from '../avatar';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface HuntInviteModalProps {
	huntId: number;
	onClose: () => void;
}

export function HuntInviteModal({ huntId, onClose }: HuntInviteModalProps) {
	const { data: availableIds, isLoading } = useQuery(
		trpc.invite.availableInvitees.queryOptions({ huntId }),
	);
	const { data: group } = useQuery(trpc.hunter.getGroup.queryOptions());
	useEffect(() => {
		if (availableIds?.length === 0) {
			onClose();
		}
	}, [availableIds?.length, onClose]);

	const { availableHunters, unavailableHunters } = useMemo(() => {
		const groupHunters = group?.hunters ?? [];
		if (!groupHunters.length || !availableIds) {
			return {};
		}

		const availableHunters: HunterSchema[] = [];
		const unavailableHunters: HunterSchema[] = [];
		for (const hunter of groupHunters) {
			if (availableIds.includes(hunter.id)) {
				availableHunters.push(hunter);
			} else {
				unavailableHunters.push(hunter);
			}
		}
		return { availableHunters, unavailableHunters };
	}, [availableIds, group?.hunters]);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				onClose();
			}
		},
		[onClose],
	);

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
		onClose();
	}, [huntId, mutate, onClose]);

	if (
		isLoading ||
		(!availableHunters?.length && !unavailableHunters?.length)
	) {
		return null;
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open>
			<DialogHeader>
				<DialogTitle>Invite hunters</DialogTitle>
			</DialogHeader>
			<DialogContent>
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
					Your group will have {HUNT_INVITE_MINUTES} minutes to accept
					or decline the hunt.
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
