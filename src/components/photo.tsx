import { ImgHTMLAttributes } from 'react';

import { PhotoSchema } from '@/lib/schemas';

interface PhotoDisplayProps extends ImgHTMLAttributes<HTMLImageElement> {
	blurDataURL?: string;
	photo: PhotoSchema;
}

export default function PhotoDisplay({
	alt = '',
	photo,
	...props
}: PhotoDisplayProps) {
	if (photo.blurry) {
		props.blurDataURL = `data:image/jpeg;base64,${photo.blurry}`;
	}
	return (
		<img
			{...props}
			alt={alt}
			height={photo.height}
			src={`/${photo.path}`}
			width={photo.width}
		/>
	);
}
