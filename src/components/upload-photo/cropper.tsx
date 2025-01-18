/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils';
import { PropsWithChildren, RefObject, SyntheticEvent, useState } from 'react';
import ReactCrop, {
	centerCrop,
	makeAspectCrop,
	PercentCrop,
	PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface UploadCropperProps extends PropsWithChildren {
	aspect?: number;
	circular: boolean;
	className?: string;
	disabled?: boolean;
	imageRef: RefObject<HTMLImageElement | null>;
	imageSrc: string;
	onComplete: (crop: PixelCrop) => void;
}

export default function UploadCropper({
	aspect = 1,
	children,
	circular,
	className,
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
			className="w-full"
			crop={crop}
			disabled={disabled}
			minHeight={100}
			onChange={(_, percentage) => setCrop(percentage)}
			onComplete={(crop) => onComplete(crop)}
		>
			<img
				alt="New image"
				className={cn(className)}
				onLoad={handleLoad}
				ref={imageRef}
				src={imageSrc}
			/>
			{children}
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
