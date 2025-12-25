import { LoaderCircle } from 'lucide-react';
import {
	ChangeEvent,
	ReactElement,
	useCallback,
	useRef,
	useState,
} from 'react';
import { PixelCrop } from 'react-image-crop';

import UploadCropper from './cropper';
import UploadDialog, { UploadDialogProps } from './dialog';
import { blobToDataUrl, imageToBlob } from './functions';

export interface UploadPhotoProps {
	aspect?: number;
	button?: ReactElement;
	circular?: boolean;
	dialogProps?: Partial<UploadDialogProps>;
	onCrop: (blob: Blob) => Promise<boolean>;
	title: string;
}

export default function UploadPhoto({
	aspect,
	button,
	circular = false,
	dialogProps,
	onCrop,
	title,
}: UploadPhotoProps) {
	const [disabled, setDisabled] = useState(false);
	const [open, setOpen] = useState(false);
	const [imgSrc, setImgSrc] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	const reset = () => {
		setDisabled(false);
		setOpen(false);
		setImgSrc('');
		setErrorMsg('');
	};

	const handleFileChange = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			if (event.target.files && event.target.files.length > 0) {
				const file = event.target.files[0];
				const imgStr = await blobToDataUrl(file);
				setImgSrc(imgStr);
				setOpen(true);
			} else {
				reset();
			}
		},
		[],
	);

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
			reset();
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
		setDisabled(true);
		try {
			const blob = await imageToBlob(imageRef.current, tempCrop);
			const result = await onCrop(blob);
			if (result) {
				reset();
				return true;
			}
			setErrorMsg('Error saving image, try again');
		} catch (err) {
			console.error(err);
			setErrorMsg('Cannot upload image, try again');
		}
		setDisabled(false);
		return false;
	}, [imgSrc, onCrop, tempCrop]);

	return (
		<>
			<input
				accept="image/*"
				className="hidden"
				disabled={disabled}
				onChange={(event) => void handleFileChange(event)}
				ref={inputRef}
				type="file"
			/>
			<UploadDialog
				{...dialogProps}
				button={button}
				disabled={disabled}
				onConfirm={handleDialogConfirm}
				open={open}
				setOpen={handleDialogOpen}
				title={title}
			>
				{!!imgSrc && (
					<UploadCropper
						aspect={aspect}
						circular={circular}
						className="rounded-lg"
						disabled={disabled}
						imageRef={imageRef}
						imageSrc={imgSrc}
						onComplete={handleCrop}
					>
						{disabled && (
							<div className="absolute top-0 bottom-0 left-0 right-0 bg-black/50 flex items-center justify-center">
								<LoaderCircle
									className="animate-spin"
									size="2rem"
								/>
							</div>
						)}
					</UploadCropper>
				)}
				{!!errorMsg && (
					<p className="text-red-500 font-bold text-right">
						{errorMsg}
					</p>
				)}
			</UploadDialog>
		</>
	);
}
