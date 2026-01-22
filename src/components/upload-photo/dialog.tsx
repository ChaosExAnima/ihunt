import type { PropsWithChildren, ReactElement } from 'react';

import { Button } from '../ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogOverlay,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';
import { DialogDescription, DialogFooter, DialogHeader } from '../ui/dialog';

export interface UploadDialogProps {
	button?: ReactElement;
	disabled?: boolean;
	onConfirm: () => Promise<boolean>;
	open: boolean;
	setOpen: (open: boolean) => void;
	title: string;
}

const defaultButton = <Button variant="secondary">Replace</Button>;

export function UploadDialog({
	button = defaultButton,
	children,
	disabled = false,
	onConfirm,
	open,
	setOpen,
	title,
}: PropsWithChildren<UploadDialogProps>) {
	const handleChange = (open: boolean) => {
		setOpen(open);
	};
	const handleConfirm = () => {
		void onConfirm?.();
	};
	return (
		<Dialog onOpenChange={handleChange} open={open}>
			<DialogTrigger asChild>{button}</DialogTrigger>
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
					<Button
						disabled={disabled}
						onClick={handleConfirm}
						variant="success"
					>
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
			<DialogOverlay />
		</Dialog>
	);
}
