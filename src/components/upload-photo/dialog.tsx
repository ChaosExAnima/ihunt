import { PropsWithChildren, useState } from 'react';

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
	onDialog?: (open: boolean) => void;
	title: string;
	triggerText?: string;
}

export default function UploadDialog({
	buttonProps = {},
	children,
	disabled = false,
	onConfirm,
	onDialog,
	title,
	triggerText = 'Replace',
}: UploadDialogProps) {
	const [openDialog, setDialogOpen] = useState(false);
	const handleChange = (open: boolean) => {
		setDialogOpen(open);
		if (onDialog) {
			onDialog(open);
		}
	};
	const handleConfirm = async () => {
		if (onConfirm) {
			const success = await onConfirm();
			if (!success) {
				return;
			}
		}
		setDialogOpen(false);
	};
	return (
		<Dialog onOpenChange={handleChange} open={openDialog}>
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
