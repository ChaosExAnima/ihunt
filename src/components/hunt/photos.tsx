import { HuntModel } from '@/lib/constants';

import PhotoDisplay from '../photo';
import { Carousel, CarouselItem } from '../ui/carousel';

export default function HuntPhotoDisplay({
	photos,
}: Pick<HuntModel, 'photos'>) {
	const className = 'rounded-lg max-w-full object-cover object-top';
	if (!photos || !photos.length) {
		return null;
	}
	if (photos.length === 1) {
		return <PhotoDisplay className={className} photo={photos[0]} />;
	}
	return (
		<>
			<Carousel>
				{photos.map((photo) => (
					<CarouselItem key={photo.id}>
						<PhotoDisplay className={className} photo={photo} />
					</CarouselItem>
				))}
			</Carousel>
			<p>foo</p>
		</>
	);
}
