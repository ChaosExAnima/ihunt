import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Header } from '@/components/header';
import { HuntDisplay } from '@/components/hunt';
import { HuntsCompleted } from '@/components/hunt/completed-list';
import { HuntLoading } from '@/components/hunt/loading';
import {
	Carousel,
	CarouselApi,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { useAvailableHunt } from '@/hooks/use-available-hunt';
import { trpc } from '@/lib/api';
import { SECOND } from '@/lib/formats';
import { cn } from '@/lib/styles';
import { Entity } from '@/lib/types';

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

	const [api, setApi] = useState<CarouselApi>();

	return (
		<>
			<Carousel className="-mx-4 flex grow flex-col" setApi={setApi}>
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
				<CurrentSlide
					active={activeHunts}
					available={availableHunts}
					api={api}
				/>
			</Carousel>
			{inviteModal}
		</>
	);
}

function CurrentSlide({
	active = [],
	available = [],
	api,
}: {
	active?: Entity[];
	available?: Entity[];
	api: CarouselApi;
}) {
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		if (!api) {
			return;
		}

		setCurrent(api.selectedScrollSnap());

		api.on('select', () => {
			setCurrent(api.selectedScrollSnap());
		});
	}, [api]);

	const dotClass = 'block size-2 rounded-full transition-colors';

	return (
		<div
			className={cn(
				'mx-auto flex gap-1 rounded-full bg-stone-300 p-1 dark:bg-stone-900',
			)}
		>
			{active.map(({ id }, index) => (
				<span
					key={id}
					className={cn(
						dotClass,
						index === current
							? 'bg-rose-500 dark:bg-rose-600'
							: 'bg-rose-600 dark:bg-rose-800',
					)}
				/>
			))}
			{available.map(({ id }, index) => (
				<span
					key={id}
					className={cn(
						dotClass,
						index + active.length === current
							? 'bg-lime-500 dark:bg-lime-600'
							: 'bg-lime-600 dark:bg-lime-800',
					)}
				/>
			))}
			{active.length === 0 && available.length === 0 && (
				<span
					className={cn(
						dotClass,
						0 === current
							? 'bg-stone-200 dark:bg-stone-400'
							: 'bg-stone-400 dark:bg-stone-600',
					)}
				/>
			)}
			<span
				className={cn(
					dotClass,
					active.length + available.length + 1 === current
						? 'bg-stone-200 dark:bg-stone-400'
						: 'bg-stone-400 dark:bg-stone-600',
				)}
			/>
		</div>
	);
}
