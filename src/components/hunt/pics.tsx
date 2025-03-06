import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Trash } from 'lucide-react';
import { useCallback } from 'react';
import { useEffect, useMemo } from 'react';
import { z } from 'zod';

import { fetchFromApi } from '@/lib/api';
import { HunterSchema, PhotoSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

import Avatar from '../avatar';
import PhotoDisplay from '../photo';
import { Button } from '../ui/button';
import UploadPhoto from '../upload-photo';
import { HuntDisplayProps } from './index';

interface HuntPics {
	activeIndex: number;
	onPick: (index: number) => void;
}

export function HuntPics({
	activeIndex,
	hunt,
	hunterId,
	onPick,
}: HuntPics & Pick<HuntDisplayProps, 'hunt' | 'hunterId'>) {
	const photos = hunt.photos;
	const currentPhoto = photos[activeIndex];

	const showPhoto = activeIndex >= 1;

	useEffect(() => {
		if (!currentPhoto && activeIndex >= 1) {
			onPick(0);
		}
	}, [activeIndex, currentPhoto, onPick]);

	if (photos.length <= 1) {
		return null;
	}
	return (
		<div className="">
			{!!currentPhoto && showPhoto && (
				<ActivePhoto
					hunterId={hunterId}
					hunters={hunt.hunters}
					huntId={hunt.id}
					photo={currentPhoto}
				/>
			)}
			<ul className="flex flex-wrap gap-2 mb-2">
				{photos.map((photo, index) => (
					<li key={photo.id}>
						<PhotoDisplay
							className={cn(
								'size-10 rounded-md cursor-pointer border border-transparent',
								index === activeIndex && 'border-rose-700',
							)}
							onClick={() => onPick(index)}
							photo={photo}
						/>
					</li>
				))}
			</ul>
			<PicPicker huntId={hunt.id} />
		</div>
	);
}

interface ActivePhotoProps {
	hunterId: number;
	hunters: HunterSchema[];
	huntId: number;
	photo: PhotoSchema;
}

function ActivePhoto({ hunterId, hunters, huntId, photo }: ActivePhotoProps) {
	const currentHunter = useMemo(
		() => hunters.find((hunter) => hunter.id === photo.hunterId),
		[photo.hunterId, hunters],
	);
	const isCurrentHunter = currentHunter?.id === hunterId;
	return (
		<div className="mb-2 rounded-md overflow-hidden relative">
			<PhotoDisplay photo={photo} />
			{!!currentHunter && !isCurrentHunter && (
				<span className="absolute right-0 bottom-0 p-2 text-white text-sm flex gap-2 items-center bg-black/40 rounded-tl-md">
					Uploaded by:
					<Avatar hunter={currentHunter} link />
				</span>
			)}
			{isCurrentHunter && (
				<DeletePhotoButton huntId={huntId} photoId={photo.id} />
			)}
		</div>
	);
}

interface DeletePhotoButtonProps {
	huntId: number;
	photoId: number;
}
function DeletePhotoButton({ huntId, photoId }: DeletePhotoButtonProps) {
	const queryClient = useQueryClient();
	const { mutate } = useMutation({
		mutationFn: () =>
			fetch(`/api/hunts/${huntId}/photos?photoId=${photoId}`, {
				method: 'DELETE',
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hunts'] }),
	});
	return (
		<Button
			className="absolute right-2 bottom-2"
			onClick={() => mutate()}
			size="icon"
			variant="destructive"
		>
			<Trash />
		</Button>
	);
}

export function PicPicker({ huntId }: Pick<ActivePhotoProps, 'huntId'>) {
	const queryClient = useQueryClient();
	const handleCrop = useCallback(
		async (image: Blob) => {
			const { success } = await fetchFromApi(
				`/api/hunts/${huntId}/photos`,
				{
					body: image,
					method: 'POST',
				},
				z.object({
					success: z.boolean(),
				}),
			);
			if (success) {
				await queryClient.invalidateQueries({ queryKey: ['hunts'] });
			}
			return success;
		},
		[huntId, queryClient],
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
