import { useMutation } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { SyntheticEvent, useCallback, useRef, useState } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop, {
	centerCrop,
	makeAspectCrop,
	PixelCrop,
	ReactCropProps,
} from 'react-image-crop';

import { imageToBlob } from '@/lib/photos';
import { MaybePromise } from '@/lib/types';
import { cn } from '@/lib/utils';

export type PhotoSaveHandler = (photo: Blob) => MaybePromise<void>;

export type UploadCropperProps = Omit<
	ReactCropProps,
	'onChange' | 'onComplete'
> & {
	circular?: boolean;
	onComplete: (photo: Blob) => void;
	originalSrc: string;
};

export function UploadCropper({
	aspect = 1,
	children,
	circular = false,
	className,
	disabled = false,
	onComplete,
	originalSrc: imageSrc,
	...otherProps
}: UploadCropperProps) {
	const imageRef = useRef<HTMLImageElement>(null);
	const [crop, setCrop] = useState<PixelCrop>();

	const handleLoad = useCallback(
		(event: SyntheticEvent<HTMLImageElement>) => {
			const { height, width } = event.currentTarget;
			setCrop(centerAspectCrop(width, height, aspect));
		},
		[aspect],
	);

	const handleComplete = useCallback(() => {
		if (!crop || !imageRef.current) {
			return;
		}
		console.log('updating photo blob');

		void imageToBlob(imageRef.current, crop).then(onComplete);
	}, [crop, onComplete]);

	return (
		<ReactCrop
			circularCrop={circular}
			className="w-full"
			crop={crop}
			minHeight={100}
			onChange={setCrop}
			onComplete={handleComplete}
			{...otherProps}
		>
			{disabled && (
				<div className="absolute top-0 bottom-0 left-0 right-0 bg-black/50 flex items-center justify-center">
					<LoaderCircle className="animate-spin" size="2rem" />
				</div>
			)}
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

export function useCropperData(onSave: PhotoSaveHandler) {
	const [errorMsg, setErrorMsg] = useState<string>();
	const [photoBlob, setPhotoBlob] = useState<Blob>();
	const { isError, mutate, reset, ...rest } = useMutation({
		mutationFn: async () => {
			if (!photoBlob) {
				throw new Error('Photo not set');
			}
			await onSave(photoBlob);
		},
		onError(error) {
			setErrorMsg(error.message);
		},
	});

	const handleReset = useCallback(() => {
		reset();
		setErrorMsg(undefined);
	}, [reset]);

	return {
		errorMsg,
		isError: isError || !!errorMsg,
		reset: handleReset,
		savePhoto: mutate,
		setErrorMsg,
		updateBlob: setPhotoBlob,
		...rest,
	};
}

function centerAspectCrop(
	mediaWidth: number,
	mediaHeight: number,
	aspect: number,
) {
	return centerCrop(
		makeAspectCrop(
			{
				unit: 'px',
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
