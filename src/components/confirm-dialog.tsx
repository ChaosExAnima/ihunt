import { ReactNode, useState } from 'react';

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
	id?: string;
	isDangerous?: boolean;
	noDescription?: boolean;
	onConfirm: () => void;
	title?: ReactNode;
	trigger: ReactNode;
}

export function ConfirmDialog({
	children,
	confirmLabel = 'Confirm',
	id,
	isDangerous,
	noDescription,
	onConfirm,
	title = 'Are you sure?',
	trigger,
}: ConfirmDialogProps) {
	const [show, setShow] = useState(false);
	return (
		<Dialog onOpenChange={setShow} open={show}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent id={id}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{!noDescription && (
					<DialogDescription className="text-primary">
						{children}
					</DialogDescription>
				)}
				{noDescription && children}
				<DialogFooter>
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
