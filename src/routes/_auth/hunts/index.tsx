import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { Header } from '@/components/header';
import { HuntDisplay } from '@/components/hunt';
import { HuntsCompleted } from '@/components/hunt/completed-list';
import { HuntLoading } from '@/components/hunt/loading';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { useAvailableHunt } from '@/hooks/use-available-hunt';
import { trpc } from '@/lib/api';
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

	const { remainingToday, onJoin, inviteModal } = useAvailableHunt();

	return (
		<>
			<Carousel className="-mx-4 flex grow flex-col">
				<CarouselContent className="min-h-full" slot="ul">
					{isLoadingAvailable && isLoadingActive && (
						<CarouselItem>
							<HuntLoading className="border-border mx-4 flex h-full flex-col border p-4 shadow-lg" />
						</CarouselItem>
					)}
					{!isLoadingActive &&
						activeHunts?.map((hunt) => (
							<CarouselItem key={hunt.id}>
								<HuntDisplay
									className="border-border mx-4 flex h-full flex-col border p-4 shadow-lg"
									hunt={hunt}
								/>
							</CarouselItem>
						))}
					{!isLoadingAvailable &&
						availableHunts?.map((hunt) => (
							<CarouselItem key={hunt.id}>
								<HuntDisplay
									className="border-border mx-4 flex h-full flex-col border p-4 shadow-lg"
									hunt={hunt}
									onAcceptHunt={onJoin}
									remainingHunts={remainingToday}
								/>
							</CarouselItem>
						))}
					{availableHunts?.length === 0 &&
						activeHunts?.length === 0 && (
							<CarouselItem>
								<div className="border-border mx-4 rounded-xl border p-4">
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
			{inviteModal}
		</>
	);
}
