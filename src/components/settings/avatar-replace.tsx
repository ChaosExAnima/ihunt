import { useMutation } from '@tanstack/react-query';

import UploadPhoto from '../upload-photo';

export function AvatarReplaceButton({ existing }: { existing?: boolean }) {
	const { mutate } = useMutation({
		mutationFn: async (blob: Blob) => {
			return true;
		},
	});
	return (
		<UploadPhoto
			circular
			onCrop={mutate}
			title={existing ? 'Replace avatar' : 'Add avatar'}
		/>
	);
}
