import {
	type ChangeEvent,
	type ReactElement,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

import { blobToDataUrl } from '@/lib/photos';

import { ControllableDialog } from '../confirm-dialog';
import { Button } from '../ui/button';
import { PhotoSaveHandler, UploadCropper, useCropperData } from './cropper';

export interface UploadPhotoProps {
	aspect?: number;
	button?: ReactElement;
	circular?: boolean;
	onSave: PhotoSaveHandler;
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
	const [imgSrc, setImgSrc] = useState('');
	const [show, setShow] = useState(false);

	const { errorMsg, isError, isPending, reset, savePhoto, updateBlob } =
		useCropperData(onSave);

	const handleCancel = useCallback(() => {
		setImgSrc('');
		reset();
		setShow(false);
		if (inputRef.current) {
			inputRef.current.value = '';
		}
	}, [reset]);

	const handleFileChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			if (event.target.files && event.target.files.length > 0) {
				const file = event.target.files[0];
				void blobToDataUrl(file).then(setImgSrc);
			}
		},
		[],
	);

	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const input = inputRef.current;
		if (!input) {
			return;
		}
		input.addEventListener('cancel', handleCancel);
		return () => {
			input.removeEventListener('cancel', handleCancel);
		};
	}, [handleCancel]);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (open) {
				setShow(true);
				inputRef?.current?.click();
			} else {
				handleCancel();
			}
		},
		[handleCancel],
	);

	return (
		<>
			<input
				accept="image/*"
				className="hidden"
				disabled={isPending}
				onChange={handleFileChange}
				ref={inputRef}
				type="file"
			/>
			<ControllableDialog
				description="Upload image"
				disabled={isPending}
				noDescription
				onConfirm={savePhoto}
				onOpenChange={handleOpenChange}
				open={show}
				title={title}
				trigger={button}
			>
				<UploadCropper
					aspect={aspect}
					circular={circular}
					className="rounded-lg"
					onComplete={updateBlob}
					originalSrc={imgSrc}
				/>
				{!!isError && (
					<p className="text-red-500 font-bold text-right">
						{errorMsg}
					</p>
				)}
			</ControllableDialog>
		</>
	);
}
