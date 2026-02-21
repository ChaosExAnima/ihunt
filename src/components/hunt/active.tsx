import { Crosshair } from 'lucide-react';
import { useState } from 'react';

import { HuntSchema, PhotoHuntSchema } from '@/lib/schemas';
import { PropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';

import { HuntBase } from './base';
import { HuntPics } from './pics';

interface HuntDisplayActiveProps {
	hunt: HuntSchema & {
		photos: PhotoHuntSchema[];
	};
}

export function HuntDisplayActive({
	className,
	hunt,
}: PropsWithClassName<HuntDisplayActiveProps>) {
	const [index, setIndex] = useState(0);
	const handlePicPick = (newIndex: number) =>
		setIndex((oldIndex) => (oldIndex === newIndex ? 0 : newIndex));
	return (
		<HuntBase
			afterHeader={
				<HuntPics
					activeIndex={index}
					hunters={hunt.hunters}
					huntId={hunt.id}
					onPick={handlePicPick}
					photos={hunt.photos}
				/>
			}
			className={cn('mx-4', className)}
			hideHeader={index > 0}
			hunt={hunt}
		>
			<div className="mt-4 flex items-center justify-center gap-2 text-center font-semibold text-rose-700">
				<Crosshair className="size-4 shrink-0" />
				Good hunting!
			</div>
		</HuntBase>
	);
}
