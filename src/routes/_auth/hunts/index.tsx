import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';

import { HuntDisplay } from '@/components/hunt';
import { HuntLoading } from '@/components/hunt/loading';
import { Card } from '@/components/ui/card';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { trpc } from '@/lib/api';
import { HUNT_MAX_PER_DAY, HuntStatus } from '@/lib/constants';
import { dateFormat, useCurrencyFormat } from '@/lib/formats';
import { HuntSchema } from '@/lib/schemas';

export const Route = createFileRoute('/_auth/hunts/')({
	component: RouteComponent,
	async loader({ context: { queryClient } }) {
		await queryClient.ensureQueryData(trpc.hunt.getPublic.queryOptions());
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

function HuntsCompleted({ hunts }: { hunts: HuntSchema[] }) {
	const huntsByDate: [string, HuntSchema[]][] = useMemo(() => {
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
	if (hunts.length === 0) {
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
	const { player } = Route.useRouteContext();
	const hunterId = player?.hunter.id;

	const { data: hunts, isLoading: isLoadingHunts } = useQuery(
		trpc.hunt.getPublic.queryOptions(),
	);
	const { data: completed, isLoading: isLoadingCompleted } = useQuery(
		trpc.hunt.getCompleted.queryOptions(),
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
		<Carousel className="my-4 flex flex-col grow">
			<CarouselContent className="min-h-full" slot="ul">
				{isLoadingHunts && (
					<CarouselItem>
						<HuntLoading className="flex flex-col h-full mx-4 border border-stone-400 dark:border-stone-800 p-4 shadow-lg" />
					</CarouselItem>
				)}
				{!isLoadingHunts &&
					hunts?.map((hunt) => (
						<CarouselItem key={hunt.id}>
							<HuntDisplay
								className="flex flex-col h-full mx-4 border border-stone-400 dark:border-stone-800 p-4 shadow-lg"
								hunt={hunt}
								hunterId={hunterId}
								onAcceptHunt={(id) => mutate({ huntId: id })}
								remainingHunts={
									HUNT_MAX_PER_DAY - acceptedToday
								}
							/>
						</CarouselItem>
					))}
				{!isLoadingCompleted && !!completed && (
					<HuntsCompleted hunts={completed} />
				)}
			</CarouselContent>
		</Carousel>
	);
}
