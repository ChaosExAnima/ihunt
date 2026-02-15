import { LoaderCircle } from 'lucide-react';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { PixelCrop } from 'react-image-crop';

import { ControllableDialog } from '../confirm-dialog';
import { Button } from '../ui/button';
import { UploadCropper } from './cropper';

interface CameraProps {
	aspect?: number;
	button: ReactElement;
	circular?: boolean;
	onCrop: (blob: Blob) => Promise<boolean>;
	title: string;
}

export function CameraUpload({
	aspect,
	button,
	circular = false,
	// onCrop,
	title,
}: CameraProps) {
	const [show, setShow] = useState(false);
	const [imageSrc, setImageSrc] = useState('');
	const imageRef = useRef<HTMLImageElement>(null);
	const [disabled, setDisabled] = useState(false);
	const [errorMsg, setErrorMsg] = useState<null | string>(null);

	const [_tempCrop, setTempComp] = useState<PixelCrop>();

	const reset = useCallback(() => {
		setDisabled(false);
		setImageSrc('');
		setErrorMsg('');
	}, []);

	const handleClose = useCallback(() => {
		reset();
		setShow(false);
	}, [reset]);

	const handleDialogConfirm = useCallback(() => {
		// setShow(false);
	}, []);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			setShow(open);
			if (!open) {
				handleClose();
			}
		},
		[handleClose],
	);

	return (
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
						<LoaderCircle className="animate-spin" size="2rem" />
					</div>
				)}
			</UploadCropper>
			{!!errorMsg && (
				<p className="text-red-500 font-bold text-right">{errorMsg}</p>
			)}
		</ControllableDialog>
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
				await videoEle.play();
			} catch (err: unknown) {
				console.warn('Stream error:', err);
				onError('Could not start camera');
			}
		},
		[onError],
	);

	const handleSwap = useCallback(() => {
		setBackCamera((prev) => !prev);
	}, []);

	useEffect(() => {
		const videoEle = videoRef.current;
		if (!videoEle) {
			console.warn('no video element:');
			return;
		}

		void handleStream(videoEle, backCamera);
	}, [backCamera, handleStream]);

	return (
		<>
			<video className="w-full h-full bg-muted/50" ref={videoRef} />
			<Button onClick={handleSwap} variant="secondary">
				Swap
			</Button>
		</>
	);
}
