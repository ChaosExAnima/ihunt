import {
	PropsWithChildren,
	RefObject,
	SyntheticEvent,
	useCallback,
	useState,
} from 'react';
import ReactCrop, {
	centerCrop,
	makeAspectCrop,
	PercentCrop,
	PixelCrop,
} from 'react-image-crop';

import { cn } from '@/lib/utils';

import 'react-image-crop/dist/ReactCrop.css';

interface UploadCropperProps extends PropsWithChildren {
	aspect?: number;
	circular?: boolean;
	className?: string;
	disabled?: boolean;
	imageRef: RefObject<HTMLImageElement | null>;
	imageSrc: string;
	onComplete: (crop: PixelCrop) => void;
}

export function UploadCropper({
	aspect = 1,
	children,
	circular = false,
	className,
	disabled = false,
	imageRef,
	imageSrc,
	onComplete,
}: UploadCropperProps) {
	const [crop, setCrop] = useState<PercentCrop>();

	const handleChange = useCallback((_: unknown, percentage: PercentCrop) => {
		setCrop(percentage);
	}, []);
	const handleComplete = useCallback(
		(crop: PixelCrop) => {
			onComplete(crop);
		},
		[onComplete],
	);
	const handleLoad = useCallback(
		(event: SyntheticEvent<HTMLImageElement>) => {
			const { height, width } = event.currentTarget;
			setCrop(centerAspectCrop(width, height, aspect));
		},
		[aspect],
	);

	return (
		<ReactCrop
			aspect={aspect}
			circularCrop={circular}
			className="w-full"
			crop={crop}
			disabled={disabled}
			minHeight={100}
			onChange={handleChange}
			onComplete={handleComplete}
		>
			{imageSrc && (
				<img
					alt="New image"
					className={cn(className)}
					onLoad={handleLoad}
					ref={imageRef}
					src={imageSrc}
				/>
			)}
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
