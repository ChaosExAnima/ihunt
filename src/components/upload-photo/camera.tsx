import { CameraIcon, LoaderCircle, SwitchCameraIcon } from 'lucide-react';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { PixelCrop } from 'react-image-crop';

import { blobToDataUrl } from '@/lib/photos';
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
	// onCrop,
	title = 'Take a photo',
}: CameraProps) {
	const [state, setState] = useState<'camera' | 'crop' | null>(null);
	const [imageSrc, setImageSrc] = useState('');
	const imageRef = useRef<HTMLImageElement>(null);
	const [disabled, setDisabled] = useState(false);
	const [errorMsg, setErrorMsg] = useState<null | string>(null);
	const [tipMessage, setTipMessage] = useState(getTip);

	const [_tempCrop, setTempComp] = useState<PixelCrop>();

	const reset = useCallback(() => {
		setDisabled(false);
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
				<DialogDescription>Tip: {tipMessage}</DialogDescription>
			</DialogContent>
		</Dialog>
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
				className="w-full h-full bg-muted/50"
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

async function detectCameraCount() {
	const devices = await navigator.mediaDevices.enumerateDevices();
	return devices.filter(({ kind }) => kind === 'videoinput');
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

async function saveVideoStill({
	onError,
	onSave,
	videoEle,
}: {
	onError: (message: string) => void;
	onSave: (image: Blob) => MaybePromise<void>;
	videoEle: HTMLVideoElement;
}) {
	try {
		videoEle.pause();

		const stream = videoEle.srcObject;
		if (!(stream instanceof MediaStream)) {
			return;
		}
		let height: number | undefined, width: number | undefined;
		const track = stream.getVideoTracks().at(0);
		if (track) {
			const imageCapture = new ImageCapture(track);
			const capabilities = await imageCapture.getPhotoCapabilities();
			if (capabilities.imageHeight) {
				height = capabilities.imageHeight?.max;
			}
			if (capabilities.imageWidth) {
				width = capabilities.imageWidth?.max;
			}
		}

		if (!width || !height) {
			onError('Invalid video size');
			return;
		}

		const canvas = new OffscreenCanvas(width, height);
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			onError('Cannot save video');
			return;
		}
		ctx.imageSmoothingQuality = 'high';

		// Save original state.
		ctx.drawImage(videoEle, 0, 0, width, height, 0, 0, width, height);
		ctx.save();

		const blob = await canvas.convertToBlob({
			quality: 0.7,
			type: 'image/jpeg',
		});
		await onSave(blob);
	} catch (err) {
		console.warn('Error with saving:', err);
		onError('Unknown error saving video');
	}
}

async function startCameraStream({
	useBack = false,
	videoEle,
}: {
	useBack?: boolean;
	videoEle: HTMLVideoElement;
}) {
	// Clean up old tracks.
	if (videoEle.srcObject instanceof MediaStream) {
		videoEle.srcObject.getTracks().forEach((track) => track.stop());
	}

	const stream = await navigator.mediaDevices.getUserMedia({
		audio: false,
		video: {
			facingMode: {
				ideal: useBack ? 'environment' : 'user',
			},
		},
	});

	videoEle.srcObject = stream;
}
