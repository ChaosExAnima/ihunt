import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Crosshair, Trash } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { HunterSchema, HuntSchema, PhotoSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

import Avatar from '../avatar';
import PhotoDisplay from '../photo';
import { Button } from '../ui/button';
import HuntBase from './base';
import { HuntPics as HuntPicsPicker } from './pics';

interface HuntDisplayActiveProps {
	hunt: HuntSchema;
	hunterId: number;
	isAccepted: boolean;
}

export function HuntDisplayActive({
	hunt,
	hunterId,
	isAccepted,
}: HuntDisplayActiveProps) {
	const [index, setIndex] = useState(-1);
	const handlePicPick = (newIndex: number) =>
		setIndex((oldIndex) => (oldIndex === newIndex ? -1 : newIndex));
	return (
		<HuntBase
			afterHeader={
				<HuntPicPicker
					activeIndex={index}
					hunt={hunt}
					hunterId={hunterId}
					onPick={handlePicPick}
				/>
			}
			className="mx-4"
			hideHeader={index >= 0}
			hunt={hunt}
			hunterId={hunterId}
			isAccepted={isAccepted}
		>
			{isAccepted && <HuntPicsPicker huntId={hunt.id} />}
			<div className="flex mt-4 gap-2 items-center justify-center text-rose-700 text-center font-semibold">
				<Crosshair className="size-4 shrink-0" />
				{isAccepted ? 'Good hunting!' : 'Ongoing'}
			</div>
		</HuntBase>
	);
}

type HuntPicsPicker = {
	activeIndex: number;
	onPick: (index: number) => void;
};

function HuntPicPicker({
	activeIndex,
	hunt,
	hunterId,
	onPick,
}: HuntPicsPicker & Pick<HuntDisplayActiveProps, 'hunt' | 'hunterId'>) {
	const photos = hunt.photos.slice(1);
	const currentPhoto = photos[activeIndex];

	useEffect(() => {
		if (!currentPhoto && activeIndex >= 0) {
			onPick(-1);
		}
	}, [activeIndex, currentPhoto, onPick]);

	if (!photos.length) {
		return null;
	}
	return (
		<div className="">
			{!!currentPhoto && (
				<ActivePhoto
					hunterId={hunterId}
					hunters={hunt.hunters}
					huntId={hunt.id}
					photo={currentPhoto}
				/>
			)}
			<div className="flex gap-2">
				{photos.map((photo, index) => (
					<PhotoDisplay
						className={cn(
							'size-10 rounded-md cursor-pointer border border-transparent',
							index === activeIndex && 'border-rose-700',
						)}
						key={photo.id}
						onClick={() => onPick(index)}
						photo={photo}
					/>
				))}
			</div>
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
