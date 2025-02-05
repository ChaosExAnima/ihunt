import { Clock, MapPin, Skull } from 'lucide-react';
import { useMemo } from 'react';

import { currencyFormatter, HuntSchema, Locale } from '@/lib/constants';
import { cn } from '@/lib/utils';

import Header from '../header';
import PhotoDisplay from '../photo';
import { Carousel, CarouselItem } from '../ui/carousel';

type HuntHeaderProps = { className?: string } & HuntSchema;

export function HuntDanger({ className = '', danger = 1, payment = 0 }) {
	return (
		<div className={cn('p-2', className)}>
			<div className="flex text-rose-700 mb-2">
				{Array.from({ length: danger }).map((_, i) => (
					<Skull key={i} />
				))}
			</div>
			{payment > 0 && (
				<span className="text-white font-semibold text-xl">
					{currencyFormatter.format(payment)}
				</span>
			)}
		</div>
	);
}

export default function HuntHeader(hunt: HuntHeaderProps) {
	return (
		<div className="relative rounded-lg overflow-hidden">
			<HuntPhotoDisplay photos={hunt.photos} />
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

export function HuntPhotoDisplay({
	className: parentClassName,
	photos,
}: Pick<HuntHeaderProps, 'className' | 'photos'>) {
	const className = cn(
		'rounded-lg max-w-full object-cover object-top',
		parentClassName,
	);
	if (!photos || !photos.length) {
		return null;
	}
	if (photos.length === 1) {
		return <PhotoDisplay className={className} photo={photos[0]} />;
	}
	return (
		<Carousel>
			{photos.map((photo) => (
				<CarouselItem key={photo.id}>
					<PhotoDisplay className={className} photo={photo} />
				</CarouselItem>
			))}
		</Carousel>
	);
}
