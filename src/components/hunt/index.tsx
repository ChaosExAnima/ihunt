'use client';

import { CircleCheckBig, Crosshair, X } from 'lucide-react';
import { useMemo } from 'react';

import { HuntSchema, HuntStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import HuntBase from './base';
import type { PropsWithClassName } from '@/lib/types';

export interface HuntProps {
	hunt: HuntSchema;
	hunterId: number;
	onAcceptHunt?: (id: number) => void;
	remainingHunts?: number;
}

export function HuntDisplay(props: PropsWithClassName<HuntProps>) {
	const { hunt, hunterId, onAcceptHunt, remainingHunts } = props;
	const isAccepted = useMemo(
		() => (hunt.hunters ?? []).some((hunter) => hunter.id === hunterId),
		[hunt.hunters, hunterId],
	);
	switch (hunt.status) {
		case HuntStatus.Active:
			return (
				<HuntBase {...props} isAccepted={isAccepted}>
					<div className="flex mt-4 gap-2 items-center justify-center text-blue-500 text-center font-semibold">
						<Crosshair className="size-4 shrink-0" />
						Ongoing
					</div>
				</HuntBase>
			);
		case HuntStatus.Available:
			const huntersLeft =
				hunt.hunters && hunt.maxHunters - hunt.hunters.length > 0;
			return (
				<HuntBase {...props} isAccepted={isAccepted}>
					{huntersLeft && !isAccepted && (
						<p className="text-center text-sm">
							You have {remainingHunts || 'no'} hunts left today.
							<br />
							<strong className="text-green-500">
								Buy iHunt Premium to unlock more!
							</strong>
						</p>
					)}
					<Button
						className="flex mx-auto rounded-full font-bold self-center"
						disabled={!huntersLeft && !isAccepted}
						onClick={() => onAcceptHunt?.(hunt.id)}
						variant={isAccepted ? 'destructive' : 'success'}
					>
						{isAccepted ? (
							<X />
						) : (
							<CircleCheckBig
								aria-label="Accept hunt"
								strokeWidth="3"
							/>
						)}
						{isAccepted ? 'Cancel' : 'Accept'}
					</Button>
				</HuntBase>
			);
		case HuntStatus.Complete:
			return (
				<HuntBase {...props} isAccepted={isAccepted}>
					<div
						className={cn(
							'flex my-4 gap-2 items-center justify-center font-semibold self-center',
							'text-green-500',
						)}
					>
						<CircleCheckBig
							aria-label="Completed Hunt"
							className="size-4 shrink-0"
							strokeWidth="3"
						/>
						Complete!
					</div>
				</HuntBase>
			);
		default:
			return null;
	}
}
