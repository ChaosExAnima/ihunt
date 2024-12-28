import Navbar from '@/components/navbar';
import { cn, isDev } from '@/lib/utils';

export default function SecureLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const devMode = isDev();
	// TODO: Check auth information here
	return (
		<div
			className={cn(
				'grow flex flex-col w-full justify-stretch',
				devMode && 'border border-stone-400 dark:border-stone-800',
				devMode && 'w-[360px] min-h-[687px] mx-auto mt-4',
			)}
		>
			<Navbar />
			<main className="grow px-4 flex flex-col gap-4">{children}</main>
		</div>
	);
}
