import { CircleAlert } from 'lucide-react';
import { PropsWithChildren } from 'react';

import { HuntModel } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import HuntHeader from './header';
import HuntHuntersDisplay from './hunters';

interface HuntBaseProps {
	className?: string;
	hunt: HuntModel;
	hunterId: number;
	isAccepted: boolean;
}

export default function HuntBase({
	children,
	className,
	hunt,
	hunterId,
	isAccepted,
}: PropsWithChildren<HuntBaseProps>) {
	return (
		<Card className={cn(className, 'flex flex-col gap-2')}>
			<HuntHeader {...hunt} />

			<HuntHuntersDisplay
				hunterId={hunterId}
				hunters={hunt.hunters}
				isAccepted={isAccepted}
				maxHunters={hunt.maxHunters}
			/>

			<div className="flex grow">
				<p className="text-primary/60 text-sm grow">
					{hunt.description}
				</p>
				<Button className="text-rose-700" size="icon" variant="ghost">
					<CircleAlert />
				</Button>
			</div>

			{children}
		</Card>
	);
}
