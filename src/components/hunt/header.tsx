import { Clock, MapPin, Skull } from 'lucide-react';

import { currencyFormatter, dateFormatter, HuntModel } from '@/lib/constants';
import { cn } from '@/lib/utils';

import Header from '../header';
import PhotoDisplay from '../photo';
import { Carousel, CarouselItem } from '../ui/carousel';

type HuntHeaderProps = { className?: string } & HuntModel;

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
			/>
		</div>
	);
}

export function HuntMeta({
	className,
	date,
	name,
}: { date?: Date } & Pick<HuntHeaderProps, 'className' | 'name'>) {
	return (
		<div className={cn('p-2 bg-black/40 w-full', className)}>
			<Header className="flex gap-2 items-center text-white" level={3}>
				{name}
			</Header>
			<p className="text-rose-600 text-xs">
				<MapPin className="inline-block align-text-bottom" size="1em" />
				Königsforst
				{date && (
					<>
						{', '}
						<Clock
							className="inline-block align-text-bottom"
							size="1em"
						/>
						{dateFormatter.format(date)}
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
