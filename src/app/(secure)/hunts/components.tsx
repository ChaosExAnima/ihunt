'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { PropsWithChildren, useMemo } from 'react';
import { z } from 'zod';

import HuntDisplay from '@/components/hunt';
import { Card } from '@/components/ui/card';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { fetchFromApi, idSchema } from '@/lib/api';
import {
	huntMaxPerDay,
	HuntSchema,
	huntSchema,
	HuntStatus,
} from '@/lib/constants';

interface HuntsCardsProps {
	hunts: HuntSchema[];
	userId: number;
}

const acceptHuntSchema = z.object({
	accepted: z.boolean(),
	huntId: idSchema,
	success: z.literal(true),
});

export function HuntsCards({ hunts: initialHunts, userId }: HuntsCardsProps) {
	const { data: hunts } = useQuery({
		initialData: initialHunts,
		queryFn: () => fetchFromApi('/api/hunts', {}, z.array(huntSchema)),
		queryKey: ['hunts'],
	});
	const { mutate } = useMutation({
		mutationFn: (id: number) =>
			fetchFromApi(
				'/api/hunts',
				{ body: { id }, method: 'POST' },
				acceptHuntSchema,
			),
	});
	const acceptedToday = useMemo(
		() =>
			hunts.filter(
				({ hunters = [], status }) =>
					(status === HuntStatus.Active ||
						status === HuntStatus.Available) &&
					hunters.find(({ id }) => id === userId),
			).length,
		[hunts, userId],
	);
	return hunts.map((hunt) => (
		<CarouselItem key={hunt.id}>
			<HuntDisplay
				className="flex flex-col h-full mx-4 border border-stone-400 dark:border-stone-800 p-4 shadow-lg"
				hunt={hunt}
				hunterId={userId}
				onAcceptHunt={(id) => mutate(id)}
				remainingHunts={huntMaxPerDay - acceptedToday}
			/>
		</CarouselItem>
	));
}

export function HuntsCompleted({ hunts }: HuntsCardsProps) {
	if (hunts.length === 0) {
		return null;
	}
	return (
		<CarouselItem>
			{hunts.map((hunt) => (
				<Card
					className="flex flex-col mx-4 border border-stone-400 dark:border-stone-800 gap-4 p-4 shadow-lg"
					key={hunt.id}
				>
					{hunt.name}
				</Card>
			))}
		</CarouselItem>
	);
}

export function HuntsWrapper({ children }: PropsWithChildren) {
	return (
		<Carousel className="-mx-4 flex flex-col grow">
			<CarouselContent className="h-full">{children}</CarouselContent>
		</Carousel>
	);
}
