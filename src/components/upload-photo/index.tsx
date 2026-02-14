import type { PixelCrop } from 'react-image-crop';

import { LoaderCircle } from 'lucide-react';
import {
	type ChangeEvent,
	type ReactElement,
	useCallback,
	useRef,
	useState,
} from 'react';

import { blobToDataUrl, imageToBlob } from '@/lib/photos';

import { ConfirmDialog } from '../confirm-dialog';
import { Button } from '../ui/button';
import { UploadCropper } from './cropper';

export interface UploadPhotoProps {
	aspect?: number;
	button?: ReactElement;
	circular?: boolean;
	onCrop: (blob: Blob) => Promise<boolean>;
	title: string;
}

const defaultButton = <Button variant="secondary">Replace</Button>;

export function UploadPhoto({
	aspect,
	button = defaultButton,
	circular = false,
	onCrop,
	title,
}: UploadPhotoProps) {
	const [disabled, setDisabled] = useState(false);
	const [imgSrc, setImgSrc] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	const reset = useCallback(() => {
		setDisabled(false);
		setImgSrc('');
		setErrorMsg('');
	}, []);

	const handleFileChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			if (event.target.files && event.target.files.length > 0) {
				const file = event.target.files[0];
				void blobToDataUrl(file).then((imgStr) => {
					setImgSrc(imgStr);
				});
			} else {
				reset();
			}
		},
		[reset],
	);

	const inputRef = useRef<HTMLInputElement>(null);
	const handleDialogCancel = useCallback(() => {
		if (inputRef.current) {
			inputRef.current.value = '';
		}
		reset();
	}, [reset]);

	const handleDialogOpen = useCallback(() => {
		inputRef?.current?.click();
	}, []);

	const [tempCrop, setTempComp] = useState<PixelCrop>();

	const imageRef = useRef<HTMLImageElement>(null);
	const handleDialogConfirm = useCallback(() => {
		void (async () => {
			if (!tempCrop || !imgSrc || !imageRef.current) {
				return;
			}
			setDisabled(true);
			try {
				const blob = await imageToBlob(imageRef.current, tempCrop);
				const result = await onCrop(blob);
				if (result) {
					reset();
					return;
				}
				setErrorMsg('Error saving image, try again');
			} catch (err) {
				console.error(err);
				setErrorMsg('Cannot upload image, try again');
			}
			setDisabled(false);
		})();
	}, [imgSrc, onCrop, reset, tempCrop]);

	return (
		<>
			<input
				accept="image/*"
				className="hidden"
				disabled={disabled}
				onChange={handleFileChange}
				ref={inputRef}
				type="file"
			/>
			<ConfirmDialog
				description="Upload image"
				disabled={disabled}
				noDescription
				onCancel={handleDialogCancel}
				onConfirm={handleDialogConfirm}
				onOpen={handleDialogOpen}
				title={title}
				trigger={button}
			>
				<UploadCropper
					aspect={aspect}
					circular={circular}
					className="rounded-lg"
					disabled={disabled}
					imageRef={imageRef}
					imageSrc={imgSrc}
					onComplete={setTempComp}
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
				{!!errorMsg && (
					<p className="text-red-500 font-bold text-right">
						{errorMsg}
					</p>
				)}
			</ConfirmDialog>
		</>
	);
}
