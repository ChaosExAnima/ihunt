import { CircleCheckBig } from 'lucide-react';

import { useCurrencyFormat } from '@/hooks/use-currency-format';
import { cn } from '@/lib/styles';

import { HuntDisplayProps } from '.';
import { Rating } from '../rating';
import { HuntBase } from './base';

export function HuntDisplayCompleted({ hunt }: HuntDisplayProps) {
	const payment = useCurrencyFormat(
		Math.floor(hunt.payment / hunt.hunters.length),
	);
	return (
		<HuntBase hideText hunt={hunt}>
			{payment && <p className="text-lg">You earned {payment}!</p>}
			{hunt.comment && (
				<>
					<p className="text-muted">
						Here's what your client had to say:
					</p>
					<blockquote>
						<Rating max={5} rating={hunt.rating} size="1em" />
						{hunt.comment
							.trim()
							.split('\n')
							.map((str, index) => (
								<p key={index}>{str}</p>
							))}
					</blockquote>
				</>
			)}
			<p
				className={cn(
					'my-4 flex items-center justify-center gap-2 self-center font-semibold',
					'text-green-500',
				)}
			>
				<CircleCheckBig
					aria-label="Completed Hunt"
					className="size-4 shrink-0"
					strokeWidth="3"
				/>
				Complete!
			</p>
		</HuntBase>
	);
}
