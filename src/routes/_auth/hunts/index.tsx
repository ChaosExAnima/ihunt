import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

import { HuntDisplay, HuntDisplayActive } from '@/components/hunt';
import { HuntsCompleted } from '@/components/hunt/completed';
import { HuntLoading } from '@/components/hunt/loading';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { useHunterId } from '@/hooks/use-hunter';
import { trpc } from '@/lib/api';
import { HUNT_MAX_PER_DAY, HuntStatus } from '@/lib/constants';

export const Route = createFileRoute('/_auth/hunts/')({
	component: RouteComponent,
	async loader({ context: { queryClient } }) {
		await Promise.allSettled([
			queryClient.ensureQueryData(trpc.hunt.getActive.queryOptions()),
			queryClient.ensureQueryData(trpc.hunt.getCompleted.queryOptions()),
		]);
	},
});

function RouteComponent() {
	const hunterId = useHunterId();

	const { data: activeHunts, isLoading: isLoadingActive } = useQuery(
		trpc.hunt.getActive.queryOptions(),
	);
	const { data: availableHunts, isLoading: isLoadingAvailable } = useQuery(
		trpc.hunt.getAvailable.queryOptions(),
	);

	const queryClient = useQueryClient();
	const { mutate } = useMutation(
		trpc.hunt.join.mutationOptions({
			async onSuccess() {
				await queryClient.invalidateQueries({
					queryKey: trpc.hunt.getAvailable.queryKey(),
				});
			},
		}),
	);

	const acceptedToday = useMemo(
		() =>
			(availableHunts ?? []).filter(
				({ hunters = [], status }) =>
					(status === HuntStatus.Active ||
						status === HuntStatus.Available) &&
					hunters.find(({ id }) => id === hunterId),
			).length,
		[availableHunts, hunterId],
	);

	return (
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
								onAcceptHunt={(id) => mutate({ huntId: id })}
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
	);
}
