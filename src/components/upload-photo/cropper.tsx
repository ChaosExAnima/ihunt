/* eslint-disable @next/next/no-img-element */
import { RefObject, SyntheticEvent, useState } from 'react';
import ReactCrop, {
	centerCrop,
	makeAspectCrop,
	PercentCrop,
	PixelCrop,
} from 'react-image-crop';

interface UploadCropperProps {
	aspect?: number;
	circular: boolean;
	disabled?: boolean;
	imageRef: RefObject<HTMLImageElement | null>;
	imageSrc: string;
	onComplete: (crop: PixelCrop) => void;
}

export default function UploadCropper({
	aspect = 1,
	circular,
	disabled = false,
	imageRef,
	imageSrc,
	onComplete,
}: UploadCropperProps) {
	const [crop, setCrop] = useState<PercentCrop>();

	const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
		const { height, width } = event.currentTarget;
		setCrop(centerAspectCrop(width, height, aspect));
	};

	return (
		<ReactCrop
			aspect={aspect}
			circularCrop={circular}
			className="rounded-full w-full"
			crop={crop}
			disabled={disabled}
			minHeight={100}
			onChange={(_, percentage) => setCrop(percentage)}
			onComplete={(crop) => onComplete(crop)}
		>
			<img
				alt="New image"
				onLoad={handleLoad}
				ref={imageRef}
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
