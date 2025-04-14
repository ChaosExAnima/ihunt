'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import UploadPhoto from '@/components/upload-photo';
import { useDebounceCallback } from '@/hooks/use-debounce-callback';
import { fetchFromApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export function AvatarReplaceButton({ existing }: { existing?: boolean }) {
	const router = useRouter();
	const handleSubmit = React.useCallback(
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

type EditableBlockBaseProps = {
	multiline?: boolean;
	onChange: (value: string) => Promise<void>;
	prefix?: string;
	value: string;
};
type EditableBlockProps = EditableBlockBaseProps &
	Omit<
		React.ComponentProps<'input'> & React.ComponentProps<'textarea'>,
		keyof EditableBlockBaseProps
	>;
export function EditableBlock({
	multiline = false,
	onChange,
	prefix,
	value: initialValue,
	...props
}: EditableBlockProps) {
	const [value, setValue] = React.useState(initialValue);
	const handleChange: React.ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement
	> = (event) => {
		let newValue = event.target.value;
		if (newValue && prefix && !newValue.startsWith(prefix)) {
			newValue = prefix + newValue;
		}
		setValue(newValue);
	};
	useDebounceCallback(onChange, value);
	const Component = multiline ? Textarea : Input;

	return <Component {...props} onChange={handleChange} value={value} />;
}

interface SettingBlockProps extends React.PropsWithChildren {
	className?: string;
	id?: string;
	label: string;
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
