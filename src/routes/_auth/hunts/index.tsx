import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';

import { HuntDisplay, HuntDisplayActive } from '@/components/hunt';
import { HuntLoading } from '@/components/hunt/loading';
import { Card } from '@/components/ui/card';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { useHunterId } from '@/hooks/use-hunter';
import { trpc } from '@/lib/api';
import { HUNT_MAX_PER_DAY, HuntStatus } from '@/lib/constants';
import { dateFormat, useCurrencyFormat } from '@/lib/formats';
import { HuntSchema } from '@/lib/schemas';

export const Route = createFileRoute('/_auth/hunts/')({
	component: RouteComponent,
	async loader({ context: { queryClient } }) {
		await Promise.allSettled([
			queryClient.ensureQueryData(trpc.hunt.getActive.queryOptions()),
			queryClient.ensureQueryData(trpc.hunt.getCompleted.queryOptions()),
		]);
	},
});

function CompletedHunt({ hunt }: { hunt: HuntSchema }) {
	const payment = useCurrencyFormat(hunt.payment);
	return (
		<li>
			<Card
				asChild
				className="block border border-stone-400 dark:border-stone-800 p-4 shadow-lg"
			>
				<Link
					params={{ huntId: hunt.id.toString() }}
					to="/hunts/$huntId"
				>
					{hunt.name}
					{payment && `‒ ${payment}`}
					<ArrowRight className="float-right" />
				</Link>
			</Card>
		</li>
	);
}

function HuntsCompleted() {
	const { data: hunts } = useQuery(trpc.hunt.getCompleted.queryOptions());

	const huntsByDate: [string, HuntSchema[]][] = useMemo(() => {
		if (!hunts) {
			return [];
		}
		const huntsByDate = new Map<string, HuntSchema[]>();
		for (const hunt of hunts) {
			const { completedAt, scheduledAt } = hunt;
			const date = scheduledAt ?? completedAt ?? new Date(0);
			const key = dateFormat(date);
			const huntsInDate = huntsByDate.get(key) ?? [];
			huntsInDate.push(hunt);
			huntsByDate.set(key, huntsInDate);
		}

		return [...huntsByDate];
	}, [hunts]);

	if (!hunts || hunts.length === 0) {
		return null;
	}

	return (
		<CarouselItem asChild>
			<ol>
				{huntsByDate.map(([date, hunts]) => (
					<li className="mx-4 mb-4" key={date}>
						<p className="mb-4">{date}</p>
						<ul className="flex flex-col gap-4">
							{hunts.map((hunt) => (
								<CompletedHunt hunt={hunt} key={hunt.id} />
							))}
						</ul>
					</li>
				))}
			</ol>
		</CarouselItem>
	);
}

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
				<HuntsCompleted />
			</CarouselContent>
		</Carousel>
	);
}
