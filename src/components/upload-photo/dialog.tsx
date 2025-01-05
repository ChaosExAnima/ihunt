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
	onConfirm: () => void;
	onDialog?: (open: boolean) => void;
	title: string;
	triggerText?: string;
}

export default function UploadDialog({
	buttonProps = {},
	children,
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
	const handleConfirm = () => {
		if (onConfirm) {
			onConfirm();
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
					<DialogClose asChild>
						<Button variant="destructive">Cancel</Button>
					</DialogClose>
					<Button onClick={handleConfirm}>Confirm</Button>
				</DialogFooter>
			</DialogContent>
			<DialogOverlay />
		</Dialog>
	);
}
