import { Clock, MapPin, Skull } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { useCurrencyFormat } from '@/hooks/use-currency-format';
import { HuntStatus, Locale } from '@/lib/constants';
import { HuntSchema } from '@/lib/schemas';
import { cn } from '@/lib/styles';
import { PropsWithClassName } from '@/lib/types';
import { arrayOfLength } from '@/lib/utils';

import { Header } from '../header';
import { DeletePhotoButton, HuntPics } from './pics';

export function HuntHeader({ hunt }: { hunt: HuntSchema }) {
	const [activePhotoId, setActivePhotoId] = useState(
		hunt.photos.at(0)?.id ?? 0,
	);

	const handleActivePhotoReset = useCallback(() => {
		const firstPhoto = hunt.photos.at(0);
		if (firstPhoto) {
			setActivePhotoId(firstPhoto.id);
		}
	}, [hunt.photos]);

	const isHunterPic =
		(hunt.photos.find(({ id }) => activePhotoId === id)?.hunterId ?? 0) > 0;

	return (
		<HuntPics
			photos={hunt.photos}
			currentId={activePhotoId}
			onPick={setActivePhotoId}
		>
			{!isHunterPic && (
				<>
					<HuntDanger
						className="absolute top-0 left-0"
						danger={hunt.danger}
						payment={hunt.payment}
					/>
					<HuntMeta
						className="absolute bottom-0"
						date={hunt.completedAt ?? hunt.scheduledAt ?? undefined}
						name={hunt.name}
						place={hunt.place}
						status={hunt.status}
					/>
				</>
			)}
			{isHunterPic && (
				<span className="absolute top-0 w-full bg-black/40 p-2 font-semibold">
					Completion proof
				</span>
			)}
			{isHunterPic && hunt.status === HuntStatus.Active && (
				<DeletePhotoButton
					id={activePhotoId}
					onDelete={handleActivePhotoReset}
				/>
			)}
		</HuntPics>
	);
}

export function HuntDanger({
	className,
	danger = 1,
	payment = 0,
}: PropsWithClassName<Pick<HuntSchema, 'danger' | 'payment'>>) {
	const paymentFormatted = useCurrencyFormat(payment);
	return (
		<div className={cn('p-2', className)}>
			<div className="mb-2 flex text-rose-700">
				{arrayOfLength(danger).map((i) => (
					<Skull key={i} />
				))}
			</div>
			{payment > 0 && (
				<span className="text-shadow text-xl font-semibold text-white">
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
	status,
}: Pick<HuntSchema, 'name' | 'place' | 'status'> & {
	className?: string;
	date?: Date;
}) {
	const formattedDate = useMemo(() => {
		if (!(date instanceof Date) || status === HuntStatus.Active) {
			return 'now';
		}
		const now = new Date();
		const today =
			now.getMonth() === date.getMonth() &&
			now.getDate() === date.getDate();

		if (today) {
			const formatter = new Intl.DateTimeFormat(Locale, {
				timeStyle: 'short',
			});
			return formatter.format(date);
		}

		const formatter = new Intl.RelativeTimeFormat('en');
		return formatter.format(date.getDate() - now.getDate(), 'days');
	}, [date, status]);
	return (
		<div className={cn('w-full bg-black/40 p-2', className)}>
			<Header className="flex items-center gap-2 text-white" level={3}>
				{name}
			</Header>
			<p className="align-text-bottom text-xs text-rose-600">
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
