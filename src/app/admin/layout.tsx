import { Metadata } from 'next';
import { PropsWithChildren, ReactNode } from 'react';

export default function AdminLayout({
	children,
	modal,
}: PropsWithChildren<{ modal: ReactNode }>) {
	return (
		<>
			<main className="grow w-full px-4 max-w-screen-lg mx-auto my-4 flex flex-col gap-4">
				{children}
			</main>
			{modal}
		</>
	);
}

export const metadata: Metadata = {
	title: 'Admin - iHunt',
};
