'use client';

import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import UploadPhoto from '@/components/upload-photo';
import { fetchFromApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useCallback } from 'react';
import { z } from 'zod';

interface SettingBlockProps extends PropsWithChildren {
	id?: string;
	label: string;
}

export function AvatarReplaceButton({ existing }: { existing?: boolean }) {
	const router = useRouter();
	const handleSubmit = useCallback(
		async (blob: Blob) => {
			const body = await fetchFromApi(
				'/settings/avatar',
				{
					body: blob,
					method: 'POST',
				},
				z.object({
					success: z.boolean(),
				}),
			);
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
