import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash } from 'lucide-react';
import { ReactNode, useCallback } from 'react';

import { trpc } from '@/lib/api';
import { PhotoHuntSchema } from '@/lib/schemas';
import { cn } from '@/lib/styles';
import { Entity } from '@/lib/types';

import { PhotoDisplay } from '../photo';
import { Button } from '../ui/button';

interface HuntPics {
	photos: PhotoHuntSchema[];
	currentId: number;
	onPick: (id: number) => void;
	children?: ReactNode;
	className?: string;
}

export function HuntPics({
	photos,
	currentId,
	onPick,
	children,
	className,
}: HuntPics) {
	const currentPhoto = photos.find(({ id }) => currentId === id);

	return (
		<div className={className}>
			{!!currentPhoto && (
				<div className="relative mb-2 overflow-hidden rounded-md">
					<PhotoDisplay
						className="aspect-square w-full"
						photo={currentPhoto}
					/>
					{children}
				</div>
			)}
			{photos.length > 1 && (
				<ul className="mb-2 grid grid-cols-6 gap-2">
					{photos.map((photo) => (
						<ListPhoto
							photo={photo}
							active={currentId === photo.id}
							setActiveId={onPick}
							key={photo.id}
						/>
					))}
				</ul>
			)}
		</div>
	);
}

function ListPhoto({
	photo,
	active,
	setActiveId,
}: {
	photo: PhotoHuntSchema;
	active: boolean;
	setActiveId: (id: number) => void;
}) {
	const handleClick = useCallback(() => {
		setActiveId(photo.id);
	}, [setActiveId, photo.id]);

	return (
		<li>
			<PhotoDisplay
				className={cn(
					'aspect-square w-full cursor-pointer rounded-md border border-transparent',
					active && 'border-foreground',
					!active && photo.hunterId && 'border-rose-800',
				)}
				photo={photo}
				onClick={handleClick}
			/>
		</li>
	);
}

export function DeletePhotoButton({
	id,
	onDelete,
}: Entity & { onDelete?: () => void }) {
	const queryClient = useQueryClient();
	const { mutate } = useMutation(
		trpc.photos.delete.mutationOptions({
			async onSuccess() {
				await queryClient.invalidateQueries({
					queryKey: trpc.hunt.getActive.queryKey(),
				});
				onDelete?.();
			},
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
