import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Crosshair, Upload } from 'lucide-react';
import { useCallback } from 'react';

import { trpc } from '@/lib/api';
import { HuntSchema, PhotoHuntSchema } from '@/lib/schemas';
import { PropsWithClassName } from '@/lib/types';

import { Button } from '../ui/button';
import { UploadPhoto } from '../upload-photo';
import { CameraUpload } from '../upload-photo/camera';
import { HuntBase } from './base';

interface HuntDisplayActiveProps {
	hunt: HuntSchema & {
		photos: PhotoHuntSchema[];
	};
}

export function HuntDisplayActive({
	className,
	hunt,
}: PropsWithClassName<HuntDisplayActiveProps>) {
	const hasUploadedPhoto = hunt.photos.some(({ hunterId }) => !!hunterId);
	return (
		<HuntBase
			className={className}
			hunt={hunt}
			afterHeader={!hasUploadedPhoto && <PicPicker huntId={hunt.id} />}
		>
			<div className="mt-4 flex items-center justify-center gap-2 text-center font-semibold text-rose-700">
				<Crosshair className="size-4 shrink-0" />
				Good hunting!
			</div>
		</HuntBase>
	);
}

function PicPicker({ huntId }: { huntId: number }) {
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
			<UploadPhoto
				button={
					<Button className="w-full">
						Upload photo
						<Upload />
					</Button>
				}
				onCrop={handleCrop}
				title="Upload a pic"
			/>
		</div>
	);
}
