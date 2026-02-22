import { DialogProps } from '@radix-ui/react-dialog';
import { ReactNode, useCallback, useState } from 'react';

import { cn } from '@/lib/styles';

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
	onCancel,
	onOpen,
	open,
	...props
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
		<ControllableDialog
			{...props}
			onOpenChange={handleOpenChange}
			open={show}
		/>
	);
}

export function ControllableDialog({
	children,
	confirmLabel = 'Confirm',
	description,
	disabled,
	id,
	isDangerous,
	noDescription,
	onConfirm,
	title = 'Are you sure?',
	trigger,
	...props
}: DialogProps & Omit<ConfirmDialogProps, 'onCancel' | 'onOpen' | 'open'>) {
	return (
		<Dialog {...props}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogContent aria-description={description ?? ''} id={id}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<DialogDescription className={cn(noDescription && 'hidden')}>
					{description ?? children}
				</DialogDescription>
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
