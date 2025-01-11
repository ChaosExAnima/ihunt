import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export default function AdminLayout({ children }: PropsWithChildren) {
	return (
		<main className="grow w-full px-4 max-w-screen-lg mx-auto my-4 flex flex-col gap-4">
			{children}
		</main>
	);
}

export const metadata: Metadata = {
	title: 'Admin - iHunt',
};
