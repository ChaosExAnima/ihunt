'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
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
import { fetchFromApi } from '@/lib/api';
import { HUNT_MAX_PER_DAY, HuntStatus } from '@/lib/constants';
import { dateFormat, useCurrencyFormat } from '@/lib/formats';
import { huntSchema, HuntSchema, idSchema } from '@/lib/schemas';

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
				remainingHunts={HUNT_MAX_PER_DAY - acceptedToday}
			/>
		</CarouselItem>
	));
}

export function HuntsCompleted({ hunts }: HuntsCardsProps) {
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

export function HuntsWrapper({ children }: PropsWithChildren) {
	return (
		<Carousel className="-mx-4 flex flex-col grow">
			<CarouselContent className="min-h-full" slot="ul">
				{children}
			</CarouselContent>
		</Carousel>
	);
}

function CompletedHunt({ hunt }: { hunt: HuntSchema }) {
	const payment = useCurrencyFormat(hunt.payment);
	return (
		<li>
			<Card
				asChild
				className="block border border-stone-400 dark:border-stone-800 p-4 shadow-lg"
			>
				<Link href={`/hunts/${hunt.id}`}>
					{`${hunt.name} ‒ ${payment}`}
					<ArrowRight className="float-right" />
				</Link>
			</Card>
		</li>
	);
}
