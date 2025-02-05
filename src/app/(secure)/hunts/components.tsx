'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { z } from 'zod';

import HuntDisplay from '@/components/hunt';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { fetchFromApi } from '@/lib/api';
import {
	huntMaxPerDay,
	HuntModel,
	huntSchema,
	HuntStatus,
} from '@/lib/constants';

interface HuntsCardsProps {
	completed: HuntModel[];
	hunts: HuntModel[];
	userId: number;
}

export function HuntsCards({ userId, ...initialHunts }: HuntsCardsProps) {
	const {
		data: { completed, hunts },
	} = useQuery({
		initialData: initialHunts,
		queryFn: () =>
			fetchFromApi(
				'/api/hunts',
				{},
				z.object({
					completed: z.array(huntSchema),
					hunts: z.array(huntSchema),
				}),
			),
		queryKey: ['hunts', userId],
	});
	const acceptedToday = useMemo(
		() =>
			hunts.filter(
				({ hunters, status }) =>
					(status === HuntStatus.Active ||
						status === HuntStatus.Available) &&
					hunters.find(({ id }) => id === userId),
			).length,
		[hunts, userId],
	);
	return (
		<Carousel className="-mx-4 flex flex-col grow">
			<CarouselContent className="h-full">
				{hunts.map((hunt) => (
					<CarouselItem key={hunt.id}>
						<HuntDisplay
							className="flex flex-col h-full mx-4 border border-stone-400 dark:border-stone-800 p-4 rounded-xl shadow-lg"
							hunt={hunt}
							hunterId={userId}
							remainingHunts={huntMaxPerDay - acceptedToday}
						/>
					</CarouselItem>
				))}
				<CompletedHunts completed={completed} userId={userId} />
			</CarouselContent>
		</Carousel>
	);
}

function CompletedHunts({
	completed,
	userId,
}: Pick<HuntsCardsProps, 'completed' | 'userId'>) {
	if (completed.length === 0) {
		return null;
	}
	return (
		<CarouselItem className="flex flex-col gap-4">
			{completed.map((hunt) => (
				<HuntDisplay
					className="mx-4 border border-stone-400 dark:border-stone-800 p-4 rounded-xl shadow-lg"
					hunt={hunt}
					hunterId={userId}
					key={hunt.id}
				/>
			))}
		</CarouselItem>
	);
}
