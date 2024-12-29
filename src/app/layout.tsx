import type { Metadata } from 'next';

import DevTools from '@/components/dev-tools';

import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Geist, Geist_Mono } from 'next/font/google';

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
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					disableTransitionOnChange
					enableSystem
				>
					<div className="flex flex-col">
						{children}
						{isDev && <DevTools />}
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
