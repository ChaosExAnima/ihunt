import { ChangeEvent, useCallback, useRef, useState } from 'react';
import { PixelCrop } from 'react-image-crop';

import UploadCropper from './cropper';
import UploadDialog from './dialog';

interface UploadPhotoProps {
	aspect?: number;
	circular?: boolean;
	onCrop: (blob: Blob) => Promise<void> | void;
	title: string;
}

export default function UploadPhoto({
	aspect,
	circular = false,
	onCrop,
	title,
}: UploadPhotoProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [imgSrc, setImgSrc] = useState('');
	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const file = event.target.files[0];
			const fileReader = new FileReader();
			fileReader.addEventListener('load', () => {
				setImgSrc(fileReader.result?.toString() || '');
			});
			fileReader.readAsDataURL(file);
		}
	};
	const handleDialogOpen = (open: boolean) => {
		if (inputRef.current) {
			if (open) {
				inputRef.current.click();
			} else {
				inputRef.current.value = '';
			}
		}

		if (!open) {
			setImgSrc('');
		}
	};
	const [tempCrop, setTempComp] = useState<PixelCrop>();
	const handleCrop = (crop: PixelCrop) => {
		setTempComp(crop);
	};
	const handleDialogConfirm = useCallback(async () => {
		if (!tempCrop || !imgSrc) {
			return;
		}
		const image = document.createElement('img');
		image.src = imgSrc;
		console.log('confirm:', image, tempCrop);

		try {
			const blob = await updateCroppedImg(image, tempCrop);
			await onCrop(blob);
		} catch (err) {
			console.error(err);
		}
		setImgSrc('');
	}, [imgSrc, onCrop, tempCrop]);
	return (
		<>
			<input
				className="hidden"
				onChange={handleInputChange}
				ref={inputRef}
				type="file"
			/>
			<UploadDialog
				onConfirm={handleDialogConfirm}
				onDialog={handleDialogOpen}
				title={title}
			>
				{!!imgSrc && (
					<UploadCropper
						aspect={aspect}
						circular={circular}
						imageSrc={imgSrc}
						onComplete={handleCrop}
					/>
				)}
			</UploadDialog>
		</>
	);
}

async function updateCroppedImg(
	image: HTMLImageElement,
	crop: PixelCrop,
): Promise<Blob> {
	const scaleX = image.naturalWidth / image.width;
	const scaleY = image.naturalHeight / image.height;

	console.log('offscreen:', scaleX, scaleY);

	const offscreen = new OffscreenCanvas(
		crop.width * scaleX,
		crop.height * scaleY,
	);

	const ctx = offscreen.getContext('2d');
	if (!ctx) {
		throw new Error('No 2d context');
	}

	ctx.drawImage(
		image,
		0,
		0,
		image.width,
		image.height,
		0,
		0,
		offscreen.width,
		offscreen.height,
	);

	return offscreen.convertToBlob({
		quality: 0.7,
		type: 'image/jpg',
	});
}
