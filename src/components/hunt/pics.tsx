import { useQueryClient } from '@tanstack/react-query';
import { Camera } from 'lucide-react';
import { useCallback } from 'react';
import { z } from 'zod';

import { fetchFromApi } from '@/lib/api';

import { Button } from '../ui/button';
import UploadPhoto from '../upload-photo';

export function HuntPics({ huntId }: { huntId: number }) {
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
		<Button variant="ghost">
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
