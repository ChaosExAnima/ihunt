import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Trash, Upload } from 'lucide-react';
import { useCallback } from 'react';
import { useEffect } from 'react';

import { trpc } from '@/lib/api';
import { PhotoHuntSchema } from '@/lib/schemas';
import { cn } from '@/lib/styles';
import { Entity } from '@/lib/types';

import { PhotoDisplay } from '../photo';
import { Button } from '../ui/button';
import { UploadPhoto } from '../upload-photo';
import { CameraUpload } from '../upload-photo/camera';

interface ActivePhotoProps {
	huntId: number;
	photo: PhotoHuntSchema;
}

interface HuntPics {
	activeIndex: number;
	huntId: number;
	onPick: (index: number) => void;
	photos: PhotoHuntSchema[];
}

export function HuntPics({ activeIndex, huntId, onPick, photos }: HuntPics) {
	const currentPhoto = photos[activeIndex];

	const showPhoto = activeIndex >= 1;

	const handlePick = useCallback(
		(index: number) => {
			return () => {
				onPick(index);
			};
		},
		[onPick],
	);

	useEffect(() => {
		if (!currentPhoto && activeIndex >= 1) {
			onPick(0);
		}
	}, [activeIndex, currentPhoto, onPick]);

	if (photos.length === 0) {
		return <PicPicker huntId={huntId} />;
	}
	const hasUploadedPhoto = photos.some(({ hunterId }) => !!hunterId);

	return (
		<div>
			{!!currentPhoto && showPhoto && (
				<ActivePhoto photo={currentPhoto} />
			)}
			<ul className="mb-2 grid grid-cols-6 gap-2">
				{photos.map((photo, index) => (
					<li key={photo.id}>
						<PhotoDisplay
							className={cn(
								'aspect-square w-full cursor-pointer rounded-md border border-transparent',
								index === activeIndex && 'border-foreground',
								index !== activeIndex &&
									photo.hunterId &&
									'border-rose-800',
							)}
							onClick={handlePick(index)}
							photo={photo}
						/>
					</li>
				))}
			</ul>
			{!hasUploadedPhoto && <PicPicker huntId={huntId} />}
		</div>
	);
}

function ActivePhoto({ photo }: Pick<ActivePhotoProps, 'photo'>) {
	return (
		<div className="relative mb-2 overflow-hidden rounded-md">
			<span className="absolute top-0 w-full bg-black/40 p-2 font-semibold">
				Completion proof
			</span>
			<PhotoDisplay className="w-full" photo={photo} />
			{photo.hunterId && <DeletePhotoButton id={photo.id} />}
		</div>
	);
}

function DeletePhotoButton({ id }: Entity) {
	const queryClient = useQueryClient();
	const { mutate } = useMutation(
		trpc.photos.delete.mutationOptions({
			onSuccess: () =>
				queryClient.invalidateQueries({
					queryKey: trpc.hunt.getActive.queryKey(),
				}),
		}),
	);
	const handleDelete = useCallback(() => {
		mutate({ id });
	}, [id, mutate]);
	return (
		<Button
			className="absolute right-2 bottom-2"
			onClick={handleDelete}
			variant="destructive"
		>
			<Trash />
			Delete and retake
		</Button>
	);
}

function PicPicker({ huntId }: Pick<ActivePhotoProps, 'huntId'>) {
	const queryClient = useQueryClient();
	const { mutateAsync } = useMutation(
		trpc.hunt.uploadPhoto.mutationOptions({
			async onSuccess() {
				await queryClient.invalidateQueries({
					queryKey: trpc.hunt.getActive.queryKey(),
				});
			},
		}),
	);
	const handleCrop = useCallback(
		async (blob: Blob) => {
			const formData = new FormData();
			formData.append('photo', blob);
			formData.append('huntId', String(huntId));
			const result = await mutateAsync(formData);
			return !!result.id;
		},
		[huntId, mutateAsync],
	);

	return (
		<div className="grid grid-cols-2 gap-2">
			<UploadPhoto
				button={
					<Button className="w-full" variant="secondary">
						Upload photo
						<Upload />
					</Button>
				}
				onCrop={handleCrop}
				title="Upload a pic"
			/>
			<CameraUpload
				button={
					<Button className="w-full" variant="success">
						Take photo
						<Camera />
					</Button>
				}
				onCrop={handleCrop}
				title="Take a photo"
			/>
		</div>
	);
}
