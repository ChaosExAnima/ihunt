'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
	FormEventHandler,
	PropsWithChildren,
	useCallback,
	useRef,
	useState,
} from 'react';

interface NewAvatarDialogProps {
	onCancel: () => void;
	onSave: () => void;
	open: boolean;
}

interface SettingBlockProps extends PropsWithChildren {
	id?: string;
	label: string;
}

export function AvatarReplaceButton() {
	const formRef = useRef<HTMLFormElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
		async (event) => {
			event.preventDefault();
			const formData = new FormData(event.currentTarget);
			await fetch('/settings/avatar', { body: formData, method: 'POST' });
			event.currentTarget.reset();
		},
		[],
	);
	const [open, setOpen] = useState(false);
	const handleChange = () => {
		setOpen(true);
	};
	const handleSave = () => {
		formRef.current?.requestSubmit();
		setOpen(false);
	};
	const handleCancel = () => {
		formRef.current?.reset();
		setOpen(false);
	};
	return (
		<>
			<Button
				onClick={() => inputRef.current?.click()}
				variant="secondary"
			>
				Replace
				<form className="hidden" onSubmit={handleSubmit} ref={formRef}>
					<input
						accept="image/*"
						name="avatar"
						onChange={handleChange}
						ref={inputRef}
						type="file"
					/>
				</form>
			</Button>
			<NewAvatarDialog
				onCancel={handleCancel}
				onSave={handleSave}
				open={open}
			/>
		</>
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

function NewAvatarDialog({ open }: NewAvatarDialogProps) {
	return (
		<Dialog open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Confirm new avatar</DialogTitle>
				</DialogHeader>
				<div></div>
				<DialogFooter>
					<Button variant="destructive">Cancel</Button>
					<Button>Confirm</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
