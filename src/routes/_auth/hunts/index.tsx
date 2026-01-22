import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback } from 'react';

import { Header } from '@/components/header';
import { HuntDisplay } from '@/components/hunt';
import { HuntsCompleted } from '@/components/hunt/completed-list';
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
	loader({ context: { queryClient } }) {
		void queryClient.prefetchQuery(trpc.hunt.getActive.queryOptions());
		void queryClient.prefetchQuery(trpc.hunt.getAvailable.queryOptions());
		void queryClient.prefetchQuery(trpc.hunt.getCompleted.queryOptions());
	},
});

function RouteComponent() {
	const { data: activeHunts, isLoading: isLoadingActive } = useSuspenseQuery({
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
			onSuccess() {
				invalidate([
					trpc.hunt.getAvailable.queryKey(),
					trpc.invite.pathKey(),
				]);
			},
		}),
	);

	const handleAcceptHunt = useCallback(
		(huntId: number) => {
			mutate({ huntId });
		},
		[mutate],
	);

	const { data: acceptedToday = 0 } = useQuery(
		trpc.hunt.getHuntsToday.queryOptions(),
	);

	return (
		<>
			<Carousel className="-mx-4 flex flex-col grow">
				<CarouselContent className="min-h-full" slot="ul">
					{isLoadingAvailable && isLoadingActive && (
						<CarouselItem>
							<HuntLoading className="flex flex-col h-full mx-4 border border-border p-4 shadow-lg" />
						</CarouselItem>
					)}
					{!isLoadingActive &&
						activeHunts?.map((hunt) => (
							<CarouselItem key={hunt.id}>
								<HuntDisplay
									className="flex flex-col h-full mx-4 border border-border p-4 shadow-lg"
									hunt={hunt}
								/>
							</CarouselItem>
						))}
					{!isLoadingAvailable &&
						availableHunts?.map((hunt) => (
							<CarouselItem key={hunt.id}>
								<HuntDisplay
									className="flex flex-col h-full mx-4 border border-border p-4 shadow-lg"
									hunt={hunt}
									onAcceptHunt={handleAcceptHunt}
									remainingHunts={
										HUNT_MAX_PER_DAY - acceptedToday
									}
								/>
							</CarouselItem>
						))}
					{availableHunts?.length === 0 &&
						activeHunts?.length === 0 && (
							<CarouselItem>
								<div className="mx-4 border border-border p-4 rounded-xl">
									<Header level={3}>
										No hunts available
									</Header>
									<p className="mt-4">
										Sorry, there aren't any hunts available
										to you right now. There may be some more
										available later!
									</p>
								</div>
							</CarouselItem>
						)}
					<CarouselItem>
						<HuntsCompleted />
					</CarouselItem>
				</CarouselContent>
			</Carousel>
		</>
	);
}
