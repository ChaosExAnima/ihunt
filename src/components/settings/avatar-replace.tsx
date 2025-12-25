import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';

import { trpc } from '@/lib/api';

import UploadPhoto from '../upload-photo';

export function AvatarReplaceButton({ existing }: { existing?: boolean }) {
	const queryClient = useQueryClient();
	const router = useRouter();
	const { mutateAsync } = useMutation(
		trpc.settings.updateAvatar.mutationOptions({
			async onSuccess() {
				await queryClient.invalidateQueries({
					queryKey: trpc.auth.me.queryKey(),
				});
				await router.invalidate();
			},
		}),
	);
	const handleCrop = useCallback(
		async (blob: Blob) => {
			const formData = new FormData();
			formData.append('photo', blob);
			const result = await mutateAsync(formData);
			return result.success;
		},
		[mutateAsync],
	);
	return (
		<UploadPhoto
			circular
			onCrop={handleCrop}
			title={existing ? 'Replace avatar' : 'Add avatar'}
		/>
	);
}
