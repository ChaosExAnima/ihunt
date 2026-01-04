import { CircleAlert } from 'lucide-react';
import { PropsWithChildren, ReactNode, useCallback, useState } from 'react';

import { HuntSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { HuntHeader } from './header';
import { HuntHuntersDisplay } from './hunters';

interface HuntBaseProps {
	afterHeader?: ReactNode;
	className?: string;
	hideHeader?: boolean;
	hideText?: boolean;
	hunt: HuntSchema;
}

export default function HuntBase({
	afterHeader,
	children,
	className,
	hideHeader = false,
	hideText = false,
	hunt,
}: PropsWithChildren<HuntBaseProps>) {
	const [showCW, setShowCW] = useState(false);
	const handleToggleCW = useCallback(() => {
		setShowCW((prev) => !prev);
	}, []);

	const { status } = hunt.reserved ?? {};
	return (
		<Card className={cn(className, 'flex flex-col gap-2 p-4')}>
			{!hideHeader && <HuntHeader {...hunt} />}
			{afterHeader}

			<HuntHuntersDisplay
				hunters={hunt.hunters}
				isReserved={status === 'reserved' || status === 'declined'}
				maxHunters={hunt.maxHunters}
			/>

			{!hideText && (
				<div className="flex grow">
					<p className="text-primary/60 text-sm grow">
						{showCW ? `CWs: ${hunt.warnings}` : hunt.description}
					</p>
					{!!hunt.warnings && (
						<Button
							className="text-rose-700 shrink-0"
							onClick={handleToggleCW}
							size="icon"
							variant="ghost"
						>
							<CircleAlert />
						</Button>
					)}
				</div>
			)}

			{children}
		</Card>
	);
}
