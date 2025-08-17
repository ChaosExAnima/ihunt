import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

import { HuntDisplay } from '@/components/hunt';
import { HuntLoading } from '@/components/hunt/loading';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { trpc } from '@/lib/api';
import { HUNT_MAX_PER_DAY, HuntStatus } from '@/lib/constants';

export const Route = createFileRoute('/_auth/hunts/')({
	component: RouteComponent,
	async loader({ context: { queryClient } }) {
		await queryClient.ensureQueryData(trpc.hunt.getPublic.queryOptions());
	},
});

function RouteComponent() {
	const { me } = Route.useRouteContext();
	const hunterId = me?.hunter.id;

	const { data: hunts, isLoading } = useQuery(
		trpc.hunt.getPublic.queryOptions(),
	);

	const { mutate } = useMutation(trpc.hunt.join.mutationOptions());

	const acceptedToday = useMemo(
		() =>
			(hunts ?? []).filter(
				({ hunters = [], status }) =>
					(status === HuntStatus.Active ||
						status === HuntStatus.Available) &&
					hunters.find(({ id }) => id === hunterId),
			).length,
		[hunts, hunterId],
	);

	return (
		<Carousel className="-mx-4 flex flex-col grow">
			<CarouselContent className="min-h-full" slot="ul">
				{isLoading && (
					<CarouselItem>
						<HuntLoading className="flex flex-col h-full mx-4 border border-stone-400 dark:border-stone-800 p-4 shadow-lg" />
					</CarouselItem>
				)}
				{!isLoading &&
					hunts?.map((hunt) => (
						<CarouselItem key={hunt.id}>
							<HuntDisplay
								className="flex flex-col h-full mx-4 border border-stone-400 dark:border-stone-800 p-4 shadow-lg"
								hunt={hunt}
								hunterId={hunterId!}
								onAcceptHunt={(id) => mutate({ huntId: id })}
								remainingHunts={
									HUNT_MAX_PER_DAY - acceptedToday
								}
							/>
						</CarouselItem>
					))}
			</CarouselContent>
		</Carousel>
	);
}
