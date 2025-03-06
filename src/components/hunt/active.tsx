import { Crosshair } from 'lucide-react';
import { useState } from 'react';

import { HuntSchema } from '@/lib/schemas';

import HuntBase from './base';
import { HuntPics } from './pics';

interface HuntDisplayActiveProps {
	hunt: HuntSchema;
	hunterId: number;
	isAccepted: boolean;
}

export function HuntDisplayActive({
	hunt,
	hunterId,
	isAccepted,
}: HuntDisplayActiveProps) {
	const [index, setIndex] = useState(0);
	const handlePicPick = (newIndex: number) =>
		setIndex((oldIndex) => (oldIndex === newIndex ? 0 : newIndex));
	return (
		<HuntBase
			afterHeader={
				isAccepted && (
					<HuntPics
						activeIndex={index}
						hunt={hunt}
						hunterId={hunterId}
						onPick={handlePicPick}
					/>
				)
			}
			className="mx-4"
			hideHeader={index > 0}
			hunt={hunt}
			hunterId={hunterId}
			isAccepted={isAccepted}
		>
			<div className="flex mt-4 gap-2 items-center justify-center text-rose-700 text-center font-semibold">
				<Crosshair className="size-4 shrink-0" />
				{isAccepted ? 'Good hunting!' : 'Ongoing'}
			</div>
		</HuntBase>
	);
}
