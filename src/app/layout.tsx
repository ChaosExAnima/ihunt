import type { Metadata } from 'next';

import { ThemeProvider } from '@/components/theme-provider';

import './globals.css';

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
					<div
						className={cn(
							'flex flex-col w-full justify-stretch',
							'border border-stone-400 dark:border-stone-800',
							process.env.NODE_ENV === 'development' &&
								'max-w-[360px] min-h-[687px] mx-auto mt-4',
						)}
					>
						{children}
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
