'use client';

import { ChangeEvent, useCallback, useRef, useState } from 'react';
import { PixelCrop } from 'react-image-crop';

import UploadCropper from './cropper';
import UploadDialog from './dialog';
import { updateCroppedImg } from './functions';

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

	const inputRef = useRef<HTMLInputElement>(null);
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
		const image = new Image();
		image.src = imgSrc;
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
