import { useMutation } from '@tanstack/react-query';
import { CameraIcon, SwitchCameraIcon } from 'lucide-react';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';

import {
	blobToDataUrl,
	detectCameraCount,
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
import {
	PhotoSaveHandler,
	UploadCropper,
	UploadCropperProps,
	useCropperData,
} from './cropper';

interface CameraProps {
	aspect?: number;
	button: ReactElement;
	circular?: boolean;
	onSave: PhotoSaveHandler;
	title?: string;
}

export function CameraUpload({
	aspect,
	button,
	circular = false,
	onSave,
	title = 'Take a photo',
}: CameraProps) {
	const [state, setState] = useState<'camera' | 'crop' | null>(null);
	const [imageSrc, setImageSrc] = useState<string>();
	const [tipMessage, setTipMessage] = useState(getTip);

	const { errorMsg, isError, savePhoto, setErrorMsg, updateBlob } =
		useCropperData(onSave);

	const handleClose = useCallback(() => {
		setState(null);
		setImageSrc(undefined);
	}, []);

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

	return (
		<Dialog onOpenChange={handleOpenChange} open={!!state}>
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
				{imageSrc && (
					<CameraCropper
						aspect={aspect}
						circular={circular}
						onCancel={handleCancelCrop}
						onComplete={updateBlob}
						onSave={savePhoto}
						originalSrc={imageSrc}
					/>
				)}
				{isError && (
					<p className="text-red-500 font-bold text-right">
						{errorMsg}
					</p>
				)}
				<DialogDescription>Tip: {tipMessage}</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}

function CameraCropper({
	disabled,
	onCancel,
	onSave,
	...otherProps
}: UploadCropperProps & { onCancel: () => void; onSave: () => void }) {
	return (
		<>
			<UploadCropper
				className="rounded-lg"
				disabled={disabled}
				{...otherProps}
			/>
			<DialogFooter>
				<Button onClick={onCancel} variant="secondary">
					Go Back
				</Button>
				<Button disabled={disabled} onClick={onSave} variant="success">
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
	const [facing, setFacing] = useState<'back' | 'front'>('front');
	const [hasBackCamera, setHasBackCamera] = useState(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);

	const handlePlay = useCallback(() => {
		void videoRef.current?.play();
	}, []);

	const handleSwap = useCallback(() => {
		if (hasBackCamera) {
			setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
		}
	}, [hasBackCamera]);

	const { isPending, mutate } = useMutation({
		mutationFn: async () => {
			const videoEle = videoRef.current;
			if (!videoEle) {
				throw new Error('No video element');
			}
			const photo = await saveVideoStill(videoEle);
			await onSave(photo);
		},
		onError(error) {
			onError(error.message);
		},
	});

	useEffect(() => {
		const videoEle = videoRef.current;
		if (!videoEle) {
			return;
		}

		const start = async () => {
			try {
				await startCameraStream({
					useBack: facing === 'back',
					videoEle,
				});
				const cameras = await detectCameraCount();
				if (cameras.length > 1) {
					setHasBackCamera(true);
				}
			} catch (err: unknown) {
				console.warn('Stream error:', err);
				onError('Could not start camera');
			}
		};

		void start();
		return () => {
			if (videoEle.srcObject instanceof MediaStream) {
				videoEle.srcObject.getTracks().forEach((track) => track.stop());
			}
		};
	}, [facing, onError]);

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
				<Button
					disabled={isPending}
					onClick={() => mutate()}
					variant="success"
				>
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
