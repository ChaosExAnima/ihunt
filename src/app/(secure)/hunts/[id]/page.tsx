import { HuntDisplay } from '@/components/hunt';
import { huntDisplayInclude } from '@/lib/constants';
import { db } from '@/lib/db';
import { huntSchema } from '@/lib/schemas';
import { sessionToHunter } from '@/server/user';

interface HuntPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function HuntPage({ params }: HuntPageProps) {
	const { id } = await params;
	const hunter = await sessionToHunter();
	try {
		const rawHunt = await db.hunt.findUnique({
			include: huntDisplayInclude,
			where: { id: Number.parseInt(id) },
		});
		const hunt = huntSchema.parse(rawHunt);
		return (
			<HuntDisplay className="h-full" hunt={hunt} hunterId={hunter.id} />
		);
	} catch (err) {
		console.error(err);
		throw new Error('Hunt not found');
	}
}
