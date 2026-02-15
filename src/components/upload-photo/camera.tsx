import { LoaderCircle } from 'lucide-react';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { PixelCrop } from 'react-image-crop';

import { Button } from '../ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
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

	return (
		<Dialog onOpenChange={handleOpenChange} open={state !== null}>
			<DialogTrigger asChild>{button}</DialogTrigger>
			<DialogContent aria-description="Upload a photo">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<CameraStream onError={setErrorMsg} />
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

function CameraStream({ onError }: { onError: (message: string) => void }) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [backCamera, setBackCamera] = useState(false);

	const handleStream = useCallback(
		async (videoEle: HTMLVideoElement, useBack = false) => {
			try {
				// Clean up old tracks.
				if (videoEle.srcObject instanceof MediaStream) {
					videoEle.srcObject
						.getTracks()
						.forEach((track) => track.stop());
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
				// await videoEle.play();
			} catch (err: unknown) {
				console.warn('Stream error:', err);
				onError('Could not start camera');
			}
		},
		[onError],
	);

	const handlePlay = useCallback(() => {
		void videoRef.current?.play();
	}, []);

	const handleSwap = useCallback(() => {
		setBackCamera((prev) => !prev);
	}, []);

	useEffect(() => {
		const videoEle = videoRef.current;
		if (!videoEle) {
			return;
		}

		void handleStream(videoEle, backCamera);
		return () => {
			if (videoEle.srcObject instanceof MediaStream) {
				videoEle.srcObject.getTracks().forEach((track) => track.stop());
			}
		};
	}, [backCamera, handleStream]);

	return (
		<>
			<video
				className="w-full h-full bg-muted/50"
				onLoadedMetadata={handlePlay}
				ref={videoRef}
			/>
			<Button onClick={handleSwap} variant="secondary">
				Swap
			</Button>
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
