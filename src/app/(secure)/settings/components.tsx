'use client';

import { useRouter } from 'next/navigation';
import {
	ChangeEventHandler,
	PropsWithChildren,
	useCallback,
	useState,
} from 'react';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import UploadPhoto from '@/components/upload-photo';
import { fetchFromApi } from '@/lib/api';
import { useDebounceCallback } from '@/lib/hooks';
import { cn } from '@/lib/utils';

interface BioBlockProps {
	multiline?: boolean;
	onChange: (value: string) => Promise<void>;
	value: string;
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

export function EditableBlock({
	multiline = false,
	onChange,
	value: initialValue,
}: BioBlockProps) {
	const [value, setValue] = useState(initialValue);
	const handleChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement
	> = (event) => {
		const newValue = event.target.value.trim();
		setValue(newValue);
	};
	useDebounceCallback(onChange, value);
	const Component = multiline ? Textarea : Input;

	return <Component onChange={handleChange} value={value} />;
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
