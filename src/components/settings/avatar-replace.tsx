import { useCallback } from 'react';
import z from 'zod';

import UploadPhoto from '../upload-photo';

export function AvatarReplaceButton({ existing }: { existing?: boolean }) {
	const handleSubmit = useCallback(
		async (blob: Blob) => {
			const body = await fetchFromApi(
				'/api/settings/avatar',
				{
					body: blob,
					method: 'POST',
				},
				z.object({
					success: z.boolean(),
				}),
			);
			return body.success;
		},
		[router],
	);

	return (
		<UploadPhoto
			circular
			onCrop={handleSubmit}
			title={existing ? 'Replace avatar' : 'Add avatar'}
		/>
	);
}
