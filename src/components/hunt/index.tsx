'use client';

import { CircleCheckBig, Crosshair, X } from 'lucide-react';
import { useMemo } from 'react';

import { HuntModel, HuntStatus } from '@/lib/constants';
import { acceptHunt } from '@/lib/hunt';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import HuntBase from './base';

export interface HuntProps {
	className?: string;
	hunt: HuntModel;
	hunterId: number;
}

export default function HuntDisplay(props: HuntProps) {
	const { hunt, hunterId } = props;
	const isAccepted = useMemo(
		() => hunt.hunters.some((hunter) => hunter.id === hunterId),
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
			return (
				<HuntBase {...props} isAccepted={isAccepted}>
					{hunt.maxHunters - hunt.hunters.length > 0 &&
						!isAccepted && (
							<p className="text-center text-sm">
								You have 2 hunts left today.
								<br />
								<strong className="text-green-500">
									Buy iHunt Premium to unlock more!
								</strong>
							</p>
						)}
					<Button
						className="flex mx-auto rounded-full font-bold self-center"
						onClick={() => acceptHunt(hunt.id)}
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
							'flex mt-4 gap-2 items-center justify-center font-semibold self-center',
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
