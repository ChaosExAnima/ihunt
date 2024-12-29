'use client';

import HuntDisplay from '@/components/hunt';
import { HuntModel } from '@/components/hunt/consts';
import {
	Carousel,
	CarouselApi,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { HuntStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface HuntsCardsProps {
	hunts: HuntModel[];
	userId: number;
}

export function HuntsCards({ hunts, userId }: HuntsCardsProps) {
	const [current, setCurrent] = useState(0);
	const [api, setApi] = useState<CarouselApi>();
	useEffect(() => {
		if (!api) {
			return;
		}

		setCurrent(api.selectedScrollSnap());
		api.on('select', () => {
			setCurrent(api.selectedScrollSnap());
		});
	}, [api]);
	return (
		<>
			<Carousel className="-mx-4 flex flex-col" setApi={setApi}>
				<CarouselContent className="grow">
					{hunts.map((hunt) => (
						<CarouselItem key={hunt.id}>
							<HuntDisplay
								className="mx-4 border border-stone-400 dark:border-stone-800 p-4 rounded-xl shadow-lg"
								hunt={hunt}
								hunterId={userId}
							/>
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
			<HuntSlider current={current} hunts={hunts} />
		</>
	);
}

function HuntSlider({
	current,
	hunts,
}: { current: number } & Pick<HuntsCardsProps, 'hunts'>) {
	if (hunts.length <= 1) {
		return null;
	}
	return (
		<div className="flex p-2 gap-1 self-center mx-auto rounded-full bg-stone-300 dark:bg-stone-900">
			{hunts.map((hunt, index) => (
				<span
					className={cn(
						'size-2 rounded-full transition-colors duration-500',
						'bg-stone-400 dark:bg-stone-700',
						hunt.status === HuntStatus.Complete &&
							'bg-stone-600 dark:bg-stone-600',
						hunt.status === HuntStatus.Active &&
							'bg-green-400 dark:bg-green-600',
						current === index && 'bg-white dark:bg-stone-200',
					)}
					key={hunt.id}
				/>
			))}
		</div>
	);
}
