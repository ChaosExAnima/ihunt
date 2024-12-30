import { db } from '@/lib/db';

interface AdminHuntParams {
	params: Promise<{
		id: string;
	}>;
}

export default async function AdminHunt({ params }: AdminHuntParams) {
	const { id } = await params;
	const hunt = await db.hunt.findFirstOrThrow({
		where: { id: Number.parseInt(id) },
	});

	return <div>{hunt.description}</div>;
}
