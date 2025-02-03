'use client';

import { useRouter } from 'next/navigation';
import {
	ChangeEventHandler,
	PropsWithChildren,
	useCallback,
	useState,
} from 'react';
import { z } from 'zod';

import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import UploadPhoto from '@/components/upload-photo';
import { fetchFromApi } from '@/lib/api';
import { useDebounceCallback } from '@/lib/hooks';
import { cn } from '@/lib/utils';

interface BioBlockProps {
	bio: string;
	onChange: (bio: string) => Promise<void>;
}

interface SettingBlockProps extends PropsWithChildren {
	className?: string;
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

export function BioBlock({ bio, onChange }: BioBlockProps) {
	const [value, setValue] = useState(bio);
	const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
		const newValue = event.target.value;
		setValue(newValue);
	};
	useDebounceCallback(onChange, value);

	return <Textarea onChange={handleChange} value={value} />;
}

export function SettingBlock({
	children,
	className,
	id,
	label,
}: SettingBlockProps) {
	return (
		<>
			<Label htmlFor={id}>{label}</Label>
			<div className={cn('flex gap-4 items-center', className)}>
				{children}
			</div>
			<Separator className="col-span-2 last:hidden" />
		</>
	);
}
