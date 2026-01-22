import { ReactNode, useCallback, useState } from 'react';

import { Button } from './ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';

export interface ConfirmDialogProps {
	children?: ReactNode;
	confirmLabel?: ReactNode;
	description?: string;
	id?: string;
	isDangerous?: boolean;
	noDescription?: boolean;
	onCancel?: () => void;
	onConfirm: () => void;
	open?: boolean;
	title?: ReactNode;
	trigger?: ReactNode;
}

export function ConfirmDialog({
	children,
	confirmLabel = 'Confirm',
	description,
	id,
	isDangerous,
	noDescription,
	onCancel,
	onConfirm,
	open = false,
	title = 'Are you sure?',
	trigger,
}: ConfirmDialogProps) {
	const [show, setShow] = useState(open);
	const handleOpenChange = useCallback(
		(open: boolean) => {
			setShow(open);
			if (!open) {
				onCancel?.();
			}
		},
		[onCancel],
	);
	return (
		<Dialog onOpenChange={handleOpenChange} open={show}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent aria-description={description ?? ''} id={id}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{!noDescription && (
					<DialogDescription>{children}</DialogDescription>
				)}
				{noDescription && children}
				<DialogFooter className="flex-row justify-end">
					<DialogClose asChild>
						<Button variant="secondary">Close</Button>
					</DialogClose>
					<Button
						onClick={onConfirm}
						variant={isDangerous ? 'destructive' : 'success'}
					>
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
