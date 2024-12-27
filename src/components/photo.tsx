import { Photo } from '@prisma/client';
import Image, { ImageProps } from 'next/image';

interface PhotoDisplayProps extends Partial<ImageProps> {
	photo: Photo;
}

export default function PhotoDisplay({
	alt = '',
	photo,
	...props
}: PhotoDisplayProps) {
	if (photo.blurry) {
		props.blurDataURL = `data:image/jpeg;base64,${photo.blurry}`;
		props.placeholder = 'blur';
	}
	return (
		<Image
			{...props}
			alt={alt}
			height={photo.height}
			src={`/${photo.path}`}
			width={photo.width}
		/>
	);
}
