import type { Metadata } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

import DevTools from '@/components/dev-tools';
import { cn } from '@/lib/utils';

import { Providers } from './providers';

const geistSans = Geist({
	subsets: ['latin'],
	variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
	subsets: ['latin'],
	variable: '--font-geist-mono',
});

export const metadata: Metadata = {
	description: 'Start your hunt today',
	title: 'iHunt',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const isDev = process.env.NODE_ENV === 'development';
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body
				className={cn(
					geistSans.variable,
					geistMono.variable,
					'antialiased bg-stone-200 dark:bg-black',
				)}
			>
				<Providers
					attribute="class"
					defaultTheme="system"
					disableTransitionOnChange
					enableSystem
				>
					<div className="flex flex-col">
						{children}
						{isDev && <DevTools />}
					</div>
				</Providers>
			</body>
		</html>
	);
}
