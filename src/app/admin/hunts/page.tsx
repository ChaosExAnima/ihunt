import Avatar, { AvatarEmpty } from '@/components/avatar';
import Header from '@/components/header';
import PhotoDisplay from '@/components/photo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default async function AdminHuntsPage() {
	const hunts = await db.hunt.findMany({
		include: {
			_count: {
				select: {
					hunters: true,
				},
			},
			hunters: {
				include: {
					photos: true,
				},
			},
			photos: true,
		},
		orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
	});
	return (
		<>
			<Header>Hunts</Header>
			<div className="grid grid-cols-3 gap-4">
				{hunts.map((hunt) => (
					<HuntCard hunt={hunt} key={hunt.id} />
				))}
			</div>
		</>
	);
}

function HuntCard({
	hunt,
}: {
	hunt: Prisma.HuntGetPayload<{
		include: { hunters: { include: { photos: true } }; photos: true };
	}>;
}) {
	const photo = hunt.photos.at(0);
	const emptyAvatars = useMemo(() => {
		return Array.from(Array(hunt.maxHunters - hunt.hunters.length)).map(
			(_, index) => (
				<li key={index}>
					<AvatarEmpty />
				</li>
			),
		);
	}, [hunt.maxHunters, hunt.hunters.length]);
	return (
		<Card key={hunt.id}>
			<CardContent className="mt-6 relative">
				{photo && (
					<PhotoDisplay
						className="aspect-square rounded-lg"
						photo={photo}
					/>
				)}
				<ul className="flex gap-2 mt-2">
					{hunt.hunters.map((hunter) => (
						<li key={hunter.id}>
							<Avatar hunter={hunter} />
						</li>
					))}
					{emptyAvatars}
				</ul>
				<Button
					className="absolute top-0 right-6 rounded-none rounded-bl-md"
					size="icon"
					variant="ghost"
				>
					<Link href={`/admin/hunts/${hunt.id}`}>
						<Pencil />
					</Link>
				</Button>
			</CardContent>
		</Card>
	);
}
