import Navbar from '@/components/navbar';
import { fetchCurrentUser } from '@/lib/user';
import { cn, isDev } from '@/lib/utils';

export default async function SecureLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const user = await fetchCurrentUser();
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
			<Navbar hunter={user} />
			<main className="grow px-4 flex flex-col gap-2 pb-4">
				{children}
			</main>
		</div>
	);
}
