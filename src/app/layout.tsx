import type { Metadata } from 'next';

import { Geist_Mono, Kanit } from 'next/font/google';

import './globals.css';

import DevTools from '@/components/dev-tools';
import { cn, isDev } from '@/lib/utils';

import { Providers } from './providers';

const kanit = Kanit({
	subsets: ['latin'],
	variable: '--font-kanit',
	weight: ['400', '700'],
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
	const devMode = isDev();
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body
				className={cn(
					kanit.variable,
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
						{devMode && <DevTools />}
					</div>
				</Providers>
			</body>
		</html>
	);
}
