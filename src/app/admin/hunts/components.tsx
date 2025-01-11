'use client';

import Avatar, { AvatarEmpty } from '@/components/avatar';
import { HuntModel } from '@/components/hunt/consts';
import PhotoDisplay from '@/components/photo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchFromApi } from '@/lib/api';
import { HuntStatus } from '@/lib/constants';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

interface HuntListProps {
	hunts: HuntModel[];
}

interface HuntProps {
	hunt: HuntModel;
}

export function HuntList({ hunts: pageHunts }: HuntListProps) {
	const { data: hunts, isLoading } = useQuery<HuntModel[]>({
		placeholderData: pageHunts,
		queryFn: () => fetchFromApi('/admin/api/hunts'),
		queryKey: ['hunts'],
	});
	if (isLoading || !Array.isArray(hunts)) {
		return '...';
	}
	return (
		<div className="grid grid-cols-3 gap-4">
			{hunts.map((hunt) => (
				<HuntCard hunt={hunt} key={hunt.id} />
			))}
		</div>
	);
}

function HuntCard({ hunt }: HuntProps) {
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
			<CardContent className="mt-6">
				<div className="relative rounded-lg overflow-hidden">
					{photo && (
						<PhotoDisplay className="aspect-square" photo={photo} />
					)}
					{hunt.status === HuntStatus.Active && (
						<HuntStatusButton hunt={hunt} />
					)}
					<Button
						className="absolute top-0 right-0 rounded-none rounded-bl-md"
						size="icon"
						variant="ghost"
					>
						<Link href={`/admin/hunts/${hunt.id}`}>
							<Pencil />
						</Link>
					</Button>
				</div>
				<ul className="flex gap-2 mt-2">
					{hunt.hunters.map((hunter) => (
						<li key={hunter.id}>
							<Avatar hunter={hunter} />
						</li>
					))}
					{emptyAvatars}
				</ul>
			</CardContent>
		</Card>
	);
}

function HuntStatusButton({ hunt }: HuntProps) {
	const { isPending, mutate } = useMutation({
		mutationFn: () =>
			fetchFromApi(`/admin/api/hunts/${hunt.id}`, {
				body: { status: HuntStatus.Complete },
				method: 'POST',
			}),
		mutationKey: ['hunts', hunt.id],
	});

	return (
		<Button
			className="absolute bottom-0 w-full text-center py-2 bg-black/40 text-green-500 font-semibold rounded-none"
			disabled={isPending}
			onClick={() => mutate()}
			variant="ghost"
		>
			Active
		</Button>
	);
}
