import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

import { HuntDisplay, HuntDisplayActive } from '@/components/hunt';
import { HuntsCompleted } from '@/components/hunt/completed-list';
import { HuntInviteModal } from '@/components/hunt/invite-dialog';
import { HuntLoading } from '@/components/hunt/loading';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { useInvalidate } from '@/hooks/use-invalidate';
import { trpc } from '@/lib/api';
import { HUNT_MAX_PER_DAY } from '@/lib/constants';
import { SECOND } from '@/lib/formats';

export const Route = createFileRoute('/_auth/hunts/')({
	component: RouteComponent,
	async loader({ context: { queryClient } }) {
		await Promise.allSettled([
			queryClient.ensureQueryData(trpc.hunt.getActive.queryOptions()),
			queryClient.ensureQueryData(trpc.hunt.getAvailable.queryOptions()),
			queryClient.ensureQueryData(trpc.hunt.getCompleted.queryOptions()),
		]);
	},
});

function RouteComponent() {
	const { data: activeHunts, isLoading: isLoadingActive } = useQuery({
		...trpc.hunt.getActive.queryOptions(),
		refetchInterval: 30 * SECOND,
	});
	const { data: availableHunts, isLoading: isLoadingAvailable } = useQuery({
		...trpc.hunt.getAvailable.queryOptions(),
		refetchInterval: 30 * SECOND,
	});

	const invalidate = useInvalidate();
	const { mutate } = useMutation(
		trpc.hunt.join.mutationOptions({
			onSuccess({ accepted, huntId }) {
				invalidate([
					trpc.hunt.getAvailable.queryKey(),
					trpc.invite.availableInvitees.queryKey(),
				]);
				if (accepted) {
					setAcceptingHuntId(huntId);
				} else {
					setAcceptingHuntId(0);
				}
			},
		}),
	);

	const [acceptingHuntId, setAcceptingHuntId] = useState(0);
	const handleAcceptHunt = useCallback(
		(huntId: number) => {
			mutate({ huntId });
		},
		[mutate],
	);
	const handleCancelAccept = useCallback(() => {
		setAcceptingHuntId(0);
	}, [setAcceptingHuntId]);

	const { data: acceptedToday = 0 } = useQuery(
		trpc.hunt.getHuntsToday.queryOptions(),
	);

	return (
		<>
			<Carousel className="-mx-4 flex flex-col grow">
				<CarouselContent className="min-h-full" slot="ul">
					{isLoadingAvailable && isLoadingActive && (
						<CarouselItem>
							<HuntLoading className="flex flex-col h-full mx-4 border border-stone-400 dark:border-stone-800 p-4 shadow-lg" />
						</CarouselItem>
					)}
					{!isLoadingActive &&
						activeHunts?.map((hunt) => (
							<CarouselItem key={hunt.id}>
								<HuntDisplayActive
									className="flex flex-col h-full mx-4 border border-stone-400 dark:border-stone-800 p-4 shadow-lg"
									hunt={hunt}
								/>
							</CarouselItem>
						))}
					{!isLoadingAvailable &&
						availableHunts?.map((hunt) => (
							<CarouselItem key={hunt.id}>
								<HuntDisplay
									className="flex flex-col h-full mx-4 border border-stone-400 dark:border-stone-800 p-4 shadow-lg"
									hunt={hunt}
									onAcceptHunt={handleAcceptHunt}
									remainingHunts={
										HUNT_MAX_PER_DAY - acceptedToday
									}
								/>
							</CarouselItem>
						))}
					<CarouselItem>
						<HuntsCompleted />
					</CarouselItem>
				</CarouselContent>
			</Carousel>
			{acceptingHuntId > 0 && (
				<HuntInviteModal
					huntId={acceptingHuntId}
					onClose={handleCancelAccept}
				/>
			)}
		</>
	);
}
