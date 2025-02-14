'use client';

import { CircleAlert } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

import { HuntSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import HuntHeader from './header';
import HuntHuntersDisplay from './hunters';

interface HuntBaseProps {
	className?: string;
	hunt: HuntSchema;
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
	const [showCW, setShowCW] = useState(false);
	return (
		<Card className={cn(className, 'flex flex-col gap-2 p-4')}>
			<HuntHeader {...hunt} />

			<HuntHuntersDisplay
				hunterId={hunterId}
				hunters={hunt.hunters}
				isAccepted={isAccepted}
				maxHunters={hunt.maxHunters}
			/>

			<div className="flex grow">
				<p className="text-primary/60 text-sm grow">
					{showCW ? `CWs: ${hunt.warnings}` : hunt.description}
				</p>
				{!!hunt.warnings && (
					<Button
						className="text-rose-700 shrink-0"
						onClick={() => setShowCW(!showCW)}
						size="icon"
						variant="ghost"
					>
						<CircleAlert />
					</Button>
				)}
			</div>

			{children}
		</Card>
	);
}
