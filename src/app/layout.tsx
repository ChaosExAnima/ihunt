import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'iHunt',
	description: 'Start your hunt today',
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
					enableSystem
					disableTransitionOnChange
				>
					<main
						className={cn(
							process.env.NODE_ENV === 'development' &&
								'max-w-[360px] min-h-[687px]',
							'mx-auto mt-4 p-4',
							'bg-background border-secondary border',
						)}
					>
						{children}
					</main>
				</ThemeProvider>
			</body>
		</html>
	);
}
