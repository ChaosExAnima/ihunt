import { CameraIcon, LoaderCircle, SwitchCameraIcon } from 'lucide-react';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { PixelCrop } from 'react-image-crop';

import {
	blobToDataUrl,
	detectCameraCount,
	imageToBlob,
	saveVideoStill,
	startCameraStream,
} from '@/lib/photos';
import { MaybePromise } from '@/lib/types';

import { Button } from '../ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';
import { UploadCropper } from './cropper';

interface CameraProps {
	aspect?: number;
	button: ReactElement;
	circular?: boolean;
	onCrop: (blob: Blob) => Promise<boolean>;
	title?: string;
}

export function CameraUpload({
	aspect,
	button,
	circular = false,
	onCrop,
	title = 'Take a photo',
}: CameraProps) {
	const [state, setState] = useState<'camera' | 'crop' | null>(null);
	const [imageSrc, setImageSrc] = useState('');
	const [errorMsg, setErrorMsg] = useState<null | string>(null);
	const [tipMessage, setTipMessage] = useState(getTip);

	const reset = useCallback(() => {
		setState(null);
		setImageSrc('');
		setErrorMsg('');
	}, []);

	const handleClose = useCallback(() => {
		reset();
		setState(null);
	}, [reset]);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (open) {
				setState('camera');
				setTipMessage(getTip);
			} else {
				handleClose();
			}
		},
		[handleClose],
	);

	const handleStartCrop = useCallback(async (photo: Blob) => {
		const dataUri = await blobToDataUrl(photo);
		setImageSrc(dataUri);
		setState('crop');
	}, []);

	const handleCancelCrop = useCallback(() => {
		setState('camera');
	}, []);

	const handleCropSave = useCallback(
		async (image: Blob) => {
			const success = await onCrop(image);
			if (success) {
				setState(null);
			} else {
				setErrorMsg('Could not save image');
			}
		},
		[onCrop],
	);

	return (
		<Dialog onOpenChange={handleOpenChange} open={state !== null}>
			<DialogTrigger asChild>{button}</DialogTrigger>
			<DialogContent aria-description="Upload a photo">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{state === 'camera' && (
					<CameraStream
						onError={setErrorMsg}
						onSave={handleStartCrop}
					/>
				)}
				{state === 'crop' && (
					<CameraCropper
						aspect={aspect}
						circular={circular}
						imageSrc={imageSrc}
						onCancel={handleCancelCrop}
						onSave={handleCropSave}
					/>
				)}
				{!!errorMsg && (
					<p className="text-right font-bold text-red-500">
						{errorMsg}
					</p>
				)}
				<DialogDescription>Tip: {tipMessage}</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}

function CameraCropper({
	aspect,
	circular,
	imageSrc,
	onCancel,
	onSave,
}: {
	aspect?: number;
	circular?: boolean;
	imageSrc: string;
	onCancel: () => void;
	onSave: (photo: Blob) => MaybePromise<void>;
}) {
	const [tempCrop, setTempComp] = useState<PixelCrop>();
	const imageRef = useRef<HTMLImageElement>(null);
	const [disabled] = useState(false);

	const handleSave = useCallback(() => {
		if (imageRef.current && tempCrop) {
			void imageToBlob(imageRef.current, tempCrop).then(onSave);
		}
	}, [onSave, tempCrop]);

	return (
		<>
			<UploadCropper
				aspect={aspect}
				circular={circular}
				className="rounded-lg"
				disabled={disabled}
				imageRef={imageRef}
				imageSrc={imageSrc}
				onComplete={setTempComp}
			>
				{disabled && (
					<div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-black/50">
						<LoaderCircle className="animate-spin" size="2rem" />
					</div>
				)}
			</UploadCropper>
			<DialogFooter>
				<Button onClick={onCancel} variant="secondary">
					Go Back
				</Button>
				<Button
					disabled={!tempCrop}
					onClick={handleSave}
					variant="success"
				>
					Save
				</Button>
			</DialogFooter>
		</>
	);
}

function CameraStream({
	onError,
	onSave,
}: {
	onError: (message: string) => void;
	onSave: (photo: Blob) => MaybePromise<void>;
}) {
	const [state, setState] = useState<'back' | 'front'>('front');
	const [hasBackCamera, setHasBackCamera] = useState(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);

	const handlePlay = useCallback(() => {
		void videoRef.current?.play();
	}, []);

	const handleSwap = useCallback(() => {
		if (hasBackCamera) {
			setState((prev) => (prev === 'back' ? 'front' : 'back'));
		}
	}, [hasBackCamera]);

	const handleSave = useCallback(() => {
		const videoEle = videoRef.current;
		if (!videoEle) {
			return;
		}
		void saveVideoStill({ onError, onSave, videoEle });
	}, [onError, onSave]);

	useEffect(() => {
		const videoEle = videoRef.current;
		if (!videoEle) {
			return;
		}

		try {
			void startCameraStream({ useBack: state === 'back', videoEle });
			void detectCameraCount().then((cameras) => {
				if (cameras.length > 1) {
					setHasBackCamera(true);
				}
			});
		} catch (err: unknown) {
			console.warn('Stream error:', err);
			onError('Could not start camera');
		}
		return () => {
			if (videoEle.srcObject instanceof MediaStream) {
				videoEle.srcObject.getTracks().forEach((track) => track.stop());
			}
		};
	}, [state, onError]);

	return (
		<>
			<video
				className="bg-muted/50 h-full w-full"
				onLoadedMetadata={handlePlay}
				ref={videoRef}
			/>
			<DialogFooter>
				{hasBackCamera && (
					<Button onClick={handleSwap} variant="secondary">
						Swap <SwitchCameraIcon />
					</Button>
				)}
				<Button onClick={handleSave} variant="success">
					Save <CameraIcon />
				</Button>
			</DialogFooter>
		</>
	);
}

function getTip() {
	const messages = [
		'Remember to smile!',
		'Avoid showing too much blood on camera',
		'A thumbs up shows you care!',
		'Try to clean up before you submit your photo',
		'Keep a can-do attitude!',
		'Maintain a professional demeanor',
	];
	const randIndex = Math.floor(Math.random() * messages.length);
	return messages[randIndex];
}
