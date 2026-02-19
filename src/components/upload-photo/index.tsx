import type { PixelCrop } from 'react-image-crop';

import { LoaderCircle } from 'lucide-react';
import {
	type ChangeEvent,
	type ReactElement,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

import { blobToDataUrl, imageToBlob } from '@/lib/photos';

import { ControllableDialog } from '../confirm-dialog';
import { Button } from '../ui/button';
import { UploadCropper } from './cropper';

export interface UploadPhotoProps {
	aspect?: number;
	button?: ReactElement;
	circular?: boolean;
	onSave: (blob: Blob) => Promise<boolean>;
	title: string;
}

const defaultButton = <Button variant="secondary">Replace</Button>;

export function UploadPhoto({
	aspect,
	button = defaultButton,
	circular = false,
	onSave,
	title,
}: UploadPhotoProps) {
	const [disabled, setDisabled] = useState(false);
	const [imgSrc, setImgSrc] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [show, setShow] = useState(false);

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
		setShow(false);
	}, [reset]);

	useEffect(() => {
		const input = inputRef.current;
		if (!input) {
			return;
		}
		input.addEventListener('cancel', handleDialogCancel);
		return () => {
			input.removeEventListener('cancel', handleDialogCancel);
		};
	}, [handleDialogCancel]);

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
				const result = await onSave(blob);
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
	}, [imgSrc, onSave, reset, tempCrop]);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			setShow(open);
			if (open) {
				handleDialogOpen();
			} else {
				handleDialogCancel();
			}
		},
		[handleDialogCancel, handleDialogOpen],
	);

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
			<ControllableDialog
				description="Upload image"
				disabled={disabled}
				noDescription
				onConfirm={handleDialogConfirm}
				onOpenChange={handleOpenChange}
				open={show}
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
			</ControllableDialog>
		</>
	);
}
