import Header from '@/components/header';
import { db } from '@/lib/db';

interface HunterPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function HunterPage({ params }: HunterPageProps) {
	const { id } = await params;

	const hunter = await db.hunter.findFirstOrThrow({
		where: { id: Number.parseInt(id) },
	});

	return (
		<>
			<Header>{hunter.name}</Header>
		</>
	);
}
