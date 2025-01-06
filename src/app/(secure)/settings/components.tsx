'use client';

import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import UploadPhoto from '@/components/upload-photo';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useCallback } from 'react';
import 'react-image-crop/dist/ReactCrop.css';

interface SettingBlockProps extends PropsWithChildren {
	id?: string;
	label: string;
}

export function AvatarReplaceButton({ existing }: { existing?: boolean }) {
	const router = useRouter();
	const handleSubmit = useCallback(
		async (blob: Blob) => {
			const response = await fetch('/settings/avatar', {
				body: blob,
				method: 'POST',
			});
			if (!response.ok) {
				console.error(response.status);
				return;
			}
			const body = await response.json();
			router.refresh();
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

export function SettingBlock({ children, id, label }: SettingBlockProps) {
	return (
		<>
			<Label htmlFor={id}>{label}</Label>
			<div className="flex gap-4 items-center">{children}</div>
			<Separator className="col-span-2 last:hidden" />
		</>
	);
}
