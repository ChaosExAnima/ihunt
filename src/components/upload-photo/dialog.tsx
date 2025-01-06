import type { PropsWithChildren } from 'react';

import { Button, ButtonProps } from '../ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogOverlay,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';
import { DialogDescription, DialogFooter, DialogHeader } from '../ui/dialog';

interface UploadDialogProps extends PropsWithChildren {
	buttonProps?: ButtonProps;
	disabled?: boolean;
	onConfirm: () => Promise<boolean>;
	open: boolean;
	setOpen: (open: boolean) => void;
	title: string;
	triggerText?: string;
}

export default function UploadDialog({
	buttonProps = {},
	children,
	disabled = false,
	onConfirm,
	open,
	setOpen,
	title,
	triggerText = 'Replace',
}: UploadDialogProps) {
	const handleChange = (open: boolean) => {
		setOpen(open);
	};
	const handleConfirm = () => {
		if (onConfirm) {
			onConfirm();
		}
	};
	return (
		<Dialog onOpenChange={handleChange} open={open}>
			<DialogTrigger asChild>
				<Button variant="secondary" {...buttonProps}>
					{triggerText}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription className="hidden">
						Upload image
					</DialogDescription>
				</DialogHeader>
				{children}
				<DialogFooter>
					<DialogClose asChild disabled={disabled}>
						<Button variant="destructive">Cancel</Button>
					</DialogClose>
					<Button disabled={disabled} onClick={handleConfirm}>
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
			<DialogOverlay />
		</Dialog>
	);
}
