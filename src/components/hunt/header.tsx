import { Clock, MapPin, Skull } from 'lucide-react';
import { useMemo } from 'react';

import { Locale } from '@/lib/constants';
import { useCurrencyFormat } from '@/lib/formats';
import { HuntSchema } from '@/lib/schemas';
import { PropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';

import Header from '../header';
import PhotoDisplay from '../photo';

type HuntHeaderProps = PropsWithClassName<HuntSchema>;

export default function HuntHeader(hunt: HuntHeaderProps) {
	const mainPhoto = hunt.photos?.at(0);
	if (!mainPhoto) {
		return null;
	}

	return (
		<div className="relative rounded-lg overflow-hidden">
			<PhotoDisplay
				className="max-w-full object-cover object-top"
				photo={mainPhoto}
			/>
			<HuntDanger
				className="top-0 left-0 absolute"
				danger={hunt.danger}
				payment={hunt.payment}
			/>
			<HuntMeta
				className="absolute bottom-0"
				date={hunt.completedAt ?? hunt.scheduledAt ?? undefined}
				name={hunt.name}
				place={hunt.place}
			/>
		</div>
	);
}

interface HuntDangerProps {
	danger?: number;
	payment?: number;
}
export function HuntDanger({
	className,
	danger = 1,
	payment = 0,
}: PropsWithClassName<HuntDangerProps>) {
	const paymentFormatted = useCurrencyFormat(payment);
	return (
		<div className={cn('p-2', className)}>
			<div className="flex text-rose-700 mb-2">
				{Array.from({ length: danger }).map((_, i) => (
					<Skull key={i} />
				))}
			</div>
			{payment > 0 && (
				<span className="text-white font-semibold text-xl text-shadow">
					{paymentFormatted}
				</span>
			)}
		</div>
	);
}

export function HuntMeta({
	className,
	date,
	name,
	place,
}: { date?: Date } & Pick<HuntHeaderProps, 'className' | 'name' | 'place'>) {
	const formattedDate = useMemo(() => {
		if (!date) {
			return '';
		}
		const now = new Date();
		const today =
			now.getFullYear() === date.getFullYear() &&
			now.getMonth() === date.getMonth() &&
			now.getDate() === date.getDate();
		const formatter = new Intl.DateTimeFormat(Locale, {
			timeStyle: today ? 'short' : undefined,
		});
		return formatter.format(date);
	}, [date]);
	return (
		<div className={cn('p-2 bg-black/40 w-full', className)}>
			<Header className="flex gap-2 items-center text-white" level={3}>
				{name}
			</Header>
			<p className="text-rose-600 text-xs align-text-bottom">
				{place && (
					<>
						<MapPin className="inline-block" size="1em" />
						&nbsp;
						{place}
					</>
				)}
				{formattedDate && (
					<>
						{place && ', '}
						<Clock className="inline-block" size="1em" />
						&nbsp;
						{formattedDate}
					</>
				)}
			</p>
		</div>
	);
}
