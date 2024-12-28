import Header from '@/components/header';
import LogInButton from '@/components/log-in';
import { db } from '@/lib/db';
import { cn, isDev } from '@/lib/utils';

export default async function Home() {
	const hunters = await db.hunter.findMany();
	const devMode = isDev();
	return (
		<main
			className={cn(
				'p-4 flex flex-col gap-4',
				devMode && 'border border-stone-400 dark:border-stone-800',
				devMode && 'w-[360px] min-h-[687px] mx-auto mt-4',
			)}
		>
			<Header>Log in as</Header>
			{hunters.map((hunter) => (
				<LogInButton hunter={hunter} key={hunter.id} />
			))}
		</main>
	);
}
