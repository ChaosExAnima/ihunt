import { db } from '@/lib/db';
import { HuntDisplay } from '@/components/hunt';
import { huntDisplayInclude, huntSchema } from '@/lib/constants';
import { sessionToHunter } from '@/lib/user';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
			where: { id: Number.parseInt(id) },
			include: huntDisplayInclude,
		});
		const hunt = huntSchema.parse(rawHunt);
		return (
			<>
				<HuntDisplay
					hunt={hunt}
					hunterId={hunter.id}
					className="h-full"
				/>
				<Card
					className="px-4 py-2 flex gap-1 items-center text-sm text-stone-400"
					asChild
				>
					<Link href="/hunts">
						<ArrowLeft className="inline-block" />
						Go back
					</Link>
				</Card>
			</>
		);
	} catch (err) {
		throw new Error('Hunt not found');
	}
}
