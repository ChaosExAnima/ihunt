import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

import { trpc } from '@/lib/api';

import UploadPhoto from '../upload-photo';

export function AvatarReplaceButton({ existing }: { existing?: boolean }) {
	const { mutateAsync } = useMutation(
		trpc.settings.updateAvatar.mutationOptions(),
	);
	const handleCrop = useCallback(async (blob: Blob) => {
		const formData = new FormData();
		formData.append('photo', blob);
		const result = await mutateAsync(formData);
		return result.success;
	}, []);
	return (
		<UploadPhoto
			circular
			onCrop={handleCrop}
			title={existing ? 'Replace avatar' : 'Add avatar'}
		/>
	);
}
