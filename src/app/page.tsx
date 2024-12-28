import Header from '@/components/header';
import LogInButton from '@/components/log-in';
import { db } from '@/lib/db';

export default async function Home() {
	const hunters = await db.hunter.findMany();
	return (
		<main className="grow p-4 flex flex-col gap-4">
			<Header level={1}>Log in as</Header>
			{hunters.map((hunter) => (
				<LogInButton hunter={hunter} key={hunter.id} />
			))}
		</main>
	);
}
