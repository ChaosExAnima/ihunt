'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PropsWithChildren, useMemo } from 'react';
import { z } from 'zod';

import { HuntDisplay } from '@/components/hunt';
import { HuntLoading } from '@/components/hunt/loading';
import { Card } from '@/components/ui/card';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { fetchFromApi, idSchema } from '@/lib/api';
import {
	currencyFormatter,
	huntMaxPerDay,
	HuntSchema,
	huntSchema,
	HuntStatus,
} from '@/lib/constants';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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
	const { data: hunts, isLoading } = useQuery({
		initialData: initialHunts,
		queryFn: () =>
			fetchFromApi(
				'/api/hunts',
				{},
				z.array(huntSchema.required({ hunters: true })),
			),
		queryKey: ['hunts'],
		structuralSharing: false,
	});
	const queryClient = useQueryClient();
	const { mutate } = useMutation({
		mutationFn: (id: number) =>
			fetchFromApi(
				'/api/hunts',
				{ body: { id }, method: 'POST' },
				acceptHuntSchema,
			),
		async onSuccess() {
			await queryClient.invalidateQueries({
				queryKey: ['hunts'],
			});
		},
	});
	const acceptedToday = useMemo(
		() =>
			(hunts ?? []).filter(
				({ hunters = [], status }) =>
					(status === HuntStatus.Active ||
						status === HuntStatus.Available) &&
					hunters.find(({ id }) => id === userId),
			).length,
		[hunts, userId],
	);
	if (!hunts || isLoading) {
		return (
			<CarouselItem>
				<HuntLoading className="flex flex-col h-full mx-4 border border-stone-400 dark:border-stone-800 p-4 shadow-lg" />
			</CarouselItem>
		);
	}
	return hunts.map((hunt) => (
		<CarouselItem key={hunt.id}>
			<HuntDisplay
				className="flex flex-col h-full mx-4 border border-stone-400 dark:border-stone-800 p-4 shadow-lg"
				hunt={hunt as HuntSchema}
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
		<CarouselItem className="flex flex-col gap-4" asChild>
			<ul>
				{hunts.map((hunt) => (
					<li key={hunt.id}>
						<Card
							className="block mx-4 border border-stone-400 dark:border-stone-800 p-4 shadow-lg"
							asChild
						>
							<Link href={`/hunts/${hunt.id}`}>
								{`${hunt.name} ‒ ${currencyFormatter.format(hunt.payment)}`}
								<ArrowRight className="float-right" />
							</Link>
						</Card>
					</li>
				))}
			</ul>
		</CarouselItem>
	);
}

export function HuntsWrapper({ children }: PropsWithChildren) {
	return (
		<Carousel className="-mx-4 flex flex-col grow">
			<CarouselContent className="max-h-full" slot="ul">
				{children}
			</CarouselContent>
		</Carousel>
	);
}
