'use client';

import { ChangeEvent, useCallback, useRef, useState } from 'react';
import { PixelCrop } from 'react-image-crop';

import UploadCropper from './cropper';
import UploadDialog from './dialog';
import { imageToBlob } from './functions';

interface UploadPhotoProps {
	aspect?: number;
	circular?: boolean;
	onCrop: (blob: Blob) => Promise<boolean>;
	title: string;
}

export default function UploadPhoto({
	aspect,
	circular = false,
	onCrop,
	title,
}: UploadPhotoProps) {
	const [imgSrc, setImgSrc] = useState('');
	const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const file = event.target.files[0];
			const imgStr = await blobToDataUrl(file);
			setImgSrc(imgStr);
			setOpen(true);
		} else {
			setOpen(false);
		}
	};

	const [open, setOpen] = useState(false);
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
			setOpen(false);
		}
	};

	const [tempCrop, setTempComp] = useState<PixelCrop>();
	const handleCrop = (crop: PixelCrop) => {
		setTempComp(crop);
	};

	const imageRef = useRef<HTMLImageElement>(null);
	const handleDialogConfirm = useCallback(async () => {
		if (!tempCrop || !imgSrc || !imageRef.current) {
			return false;
		}
		try {
			const blob = await imageToBlob(imageRef.current, tempCrop);
			const result = await onCrop(blob);
			if (!result) {
				return false;
			}
		} catch (err) {
			console.error(err);
			return false;
		}
		setOpen(false);
		setImgSrc('');
		return true;
	}, [imgSrc, onCrop, tempCrop]);

	return (
		<>
			<input
				accept="image/*"
				className="hidden"
				onChange={handleInputChange}
				ref={inputRef}
				type="file"
			/>
			<UploadDialog
				onConfirm={handleDialogConfirm}
				open={open}
				setOpen={handleDialogOpen}
				title={title}
			>
				{!!imgSrc && (
					<UploadCropper
						aspect={aspect}
						circular={circular}
						imageRef={imageRef}
						imageSrc={imgSrc}
						onComplete={handleCrop}
					/>
				)}
			</UploadDialog>
		</>
	);
}

function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((result, reject) => {
		const reader = new FileReader();
		reader.onload = () => result(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.onabort = () => reject(new Error('Read aborted'));
		reader.readAsDataURL(blob);
	});
}
