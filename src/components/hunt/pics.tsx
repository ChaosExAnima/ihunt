import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Trash } from 'lucide-react';
import { useCallback } from 'react';
import { useEffect, useMemo } from 'react';

import { useHunterId } from '@/hooks/use-hunter';
import { trpc } from '@/lib/api';
import { HunterSchema, PhotoHuntSchema } from '@/lib/schemas';
import { Entity } from '@/lib/types';
import { cn } from '@/lib/utils';

import Avatar from '../avatar';
import PhotoDisplay from '../photo';
import { Button } from '../ui/button';
import UploadPhoto from '../upload-photo';

interface ActivePhotoProps {
	hunters: HunterSchema[];
	huntId: number;
	photo: PhotoHuntSchema;
}

interface HuntPics {
	activeIndex: number;
	hunters: HunterSchema[];
	huntId: number;
	onPick: (index: number) => void;
	photos: PhotoHuntSchema[];
}

export function HuntPics({
	activeIndex,
	hunters,
	huntId,
	onPick,
	photos,
}: HuntPics) {
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
	return (
		<div className="">
			{!!currentPhoto && showPhoto && (
				<ActivePhoto hunters={hunters} photo={currentPhoto} />
			)}
			<ul className="grid grid-cols-6 gap-2 mb-2">
				{photos.map((photo, index) => (
					<li key={photo.id}>
						<PhotoDisplay
							className={cn(
								'aspect-square w-full rounded-md cursor-pointer border border-transparent',
								index === activeIndex && 'border-rose-700',
							)}
							onClick={handlePick(index)}
							photo={photo}
						/>
					</li>
				))}
			</ul>
			<PicPicker huntId={huntId} />
		</div>
	);
}

function ActivePhoto({
	hunters,
	photo,
}: Pick<ActivePhotoProps, 'hunters' | 'photo'>) {
	const currentHunter = useMemo(
		() => hunters.find((hunter) => hunter.id === photo.hunterId),
		[photo.hunterId, hunters],
	);
	const currentHunterId = useHunterId();
	const isCurrentHunter = currentHunter?.id === currentHunterId;
	return (
		<div className="mb-2 rounded-md overflow-hidden relative">
			<PhotoDisplay className="w-full" photo={photo} />
			{!!currentHunter && !isCurrentHunter && (
				<span className="absolute right-0 bottom-0 p-2 text-white text-sm flex gap-2 items-center bg-black/40 rounded-tl-md">
					Uploaded by:
					<Avatar hunter={currentHunter} link />
				</span>
			)}
			{isCurrentHunter && <DeletePhotoButton id={photo.id} />}
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
			size="icon"
			variant="destructive"
		>
			<Trash />
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
	const button = (
		<Button className="w-full" variant="secondary">
			Upload photos
			<Camera />
		</Button>
	);
	return (
		<UploadPhoto
			dialogProps={{
				button,
			}}
			onCrop={handleCrop}
			title="Upload a pic"
		/>
	);
}
