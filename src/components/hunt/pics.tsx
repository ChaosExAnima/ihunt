import { Camera } from 'lucide-react';
import { useCallback } from 'react';
import { z } from 'zod';

import { fetchFromApi } from '@/lib/api';

import { Button } from '../ui/button';
import UploadPhoto from '../upload-photo';

export function HuntPics({ huntId }: { huntId: number }) {
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
			return success;
		},
		[huntId],
	);
	return (
		<UploadPhoto
			dialogProps={{
				button: (
					<Button size="icon" variant="ghost">
						<Camera />
					</Button>
				),
			}}
			onCrop={handleCrop}
			title="Upload a pic"
		/>
	);
}
