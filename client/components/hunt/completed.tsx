import { useCurrencyFormat } from '@/hooks/use-currency-format';

import { HuntDisplayProps } from '.';
import { Rating } from '../rating';
import { HuntBase } from './base';

export function HuntDisplayCompleted({
	hunt,
	payment,
}: HuntDisplayProps & { payment?: number }) {
	const formattedPayment = useCurrencyFormat(
		Math.floor(payment ?? hunt.payment / hunt.spots.length),
	);
	return (
		<HuntBase hideText hunt={hunt}>
			{hunt.status === 'complete' && formattedPayment && (
				<p className="text-lg">You earned {formattedPayment}!</p>
			)}
			{hunt.status === 'reviewing' && (
				<p className="text-muted">
					Client is reviewing the results and will rate your hunt soon.
				</p>
			)}
			{hunt.comment && (
				<>
					<p className="text-muted">Here's what your client had to say:</p>
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
		</HuntBase>
	);
}
