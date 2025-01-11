'use client';

import {
	Dialog,
	DialogContent,
	DialogOverlay,
	DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';

export default function Modal({ children }: PropsWithChildren) {
	const router = useRouter();
	return (
		<Dialog onOpenChange={() => router.back()} open>
			<DialogTitle>Edit Hunt</DialogTitle>
			<DialogContent>{children}</DialogContent>
			<DialogOverlay />
		</Dialog>
	);
}
