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
	disabled?: boolean;
	id?: string;
	isDangerous?: boolean;
	noDescription?: boolean;
	onCancel?: () => void;
	onConfirm: () => void;
	onOpen?: () => void;
	open?: boolean;
	title?: ReactNode;
	trigger?: ReactNode;
}

export function ConfirmDialog({
	children,
	confirmLabel = 'Confirm',
	description,
	disabled,
	id,
	isDangerous,
	noDescription,
	onCancel,
	onConfirm,
	onOpen,
	open = false,
	title = 'Are you sure?',
	trigger,
}: ConfirmDialogProps) {
	const [show, setShow] = useState(open);
	const handleOpenChange = useCallback(
		(open: boolean) => {
			setShow(open);
			if (open) {
				onOpen?.();
			} else {
				onCancel?.();
			}
		},
		[onCancel, onOpen],
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
						<Button disabled={disabled} variant="secondary">
							Close
						</Button>
					</DialogClose>
					<Button
						disabled={disabled}
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
