/* eslint-disable @next/next/no-img-element */
import { SyntheticEvent, useRef, useState } from 'react';
import ReactCrop, {
	centerCrop,
	Crop,
	makeAspectCrop,
	PixelCrop,
} from 'react-image-crop';

interface UploadCropperProps {
	aspect?: number;
	circular: boolean;
	imageSrc: string;
	onComplete: (crop: PixelCrop) => void;
}

export default function UploadCropper({
	aspect = 1,
	circular,
	imageSrc,
	onComplete,
}: UploadCropperProps) {
	const [crop, setCrop] = useState<Crop>();
	const imgRef = useRef<HTMLImageElement>(null);

	const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
		const { height, width } = event.currentTarget;
		setCrop(centerAspectCrop(width, height, aspect));
	};

	return (
		<ReactCrop
			aspect={aspect}
			circularCrop={circular}
			className="rounded-full w-full aspect-square"
			crop={crop}
			minHeight={100}
			onChange={(_, percentage) => setCrop(percentage)}
			onComplete={(c) => onComplete(c)}
		>
			<img
				alt="New image"
				onLoad={handleLoad}
				ref={imgRef}
				src={imageSrc}
			/>
		</ReactCrop>
	);
}

function centerAspectCrop(
	mediaWidth: number,
	mediaHeight: number,
	aspect: number,
) {
	return centerCrop(
		makeAspectCrop(
			{
				unit: '%',
				width: 90,
			},
			aspect,
			mediaWidth,
			mediaHeight,
		),
		mediaWidth,
		mediaHeight,
	);
}
