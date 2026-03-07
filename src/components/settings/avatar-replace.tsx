import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useInvalidate } from '@/hooks/use-invalidate';
import { trpc } from '@/lib/api';

import { Button } from '../ui/button';
import { UploadPhoto } from '../upload-photo';

export function AvatarReplaceButton({ existing }: { existing?: boolean }) {
	const invalidate = useInvalidate();

	const { mutateAsync } = useMutation(
		trpc.settings.updateAvatar.mutationOptions({
			onSuccess() {
				invalidate(trpc.auth.me.queryKey());
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

	const { mutate: removeAvatar } = useMutation(
		trpc.settings.removeAvatar.mutationOptions({
			onSuccess() {
				invalidate(trpc.auth.me.queryKey());
			},
		}),
	);
	const handleRemove = useCallback(() => {
		removeAvatar();
	}, [removeAvatar]);

	return (
		<>
			<UploadPhoto
				circular
				onCrop={handleCrop}
				title={existing ? 'Replace avatar' : 'Add avatar'}
			/>
			{existing && (
				<Button variant="destructive" onClick={handleRemove}>
					Remove
				</Button>
			)}
		</>
	);
}
