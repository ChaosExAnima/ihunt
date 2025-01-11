'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';

export default function Modal({ children }: PropsWithChildren) {
	const router = useRouter();
	return (
		<Dialog onOpenChange={() => router.back()} open>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Hunt</DialogTitle>
					<DialogDescription className="hidden">
						Edit hunt information
					</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
			<DialogOverlay />
		</Dialog>
	);
}
