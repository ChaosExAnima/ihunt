import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export default function AdminLayout({ children }: PropsWithChildren) {
	return children;
}

export const metadata: Metadata = {
	title: 'Admin - iHunt',
};
