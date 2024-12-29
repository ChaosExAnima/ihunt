'use client';

import HuntDisplay from '@/components/hunt';
import { HuntModel } from '@/components/hunt/consts';
import {
	Carousel,
	CarouselApi,
	CarouselContent,
	CarouselItem,
} from '@/components/ui/carousel';
import { useEffect, useState } from 'react';

interface HuntsCardsProps {
	hunts: HuntModel[];
	userId: number;
}

export function HuntsCards({ hunts, userId }: HuntsCardsProps) {
	const [current, setCurrent] = useState(0);
	const [total, setTotal] = useState(0);
	const [api, setApi] = useState<CarouselApi>();
	useEffect(() => {
		if (!api) {
			return;
		}

		setCurrent(api.selectedScrollSnap() + 1);
		setTotal(api.scrollSnapList().length);

		api.on('select', () => {
			setCurrent(api.selectedScrollSnap() + 1);
		});
	}, [api]);
	return (
		<Carousel className="-mx-4 space-y-4" setApi={setApi}>
			<CarouselContent>
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
			<p className="text-center">
				Hunt {current} of {total}
			</p>
		</Carousel>
	);
}
