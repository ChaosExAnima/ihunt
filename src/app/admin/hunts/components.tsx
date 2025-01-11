'use client';

import Avatar, { AvatarEmpty } from '@/components/avatar';
import Header from '@/components/header';
import { HuntModel } from '@/components/hunt/consts';
import PhotoDisplay from '@/components/photo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchFromApi } from '@/lib/api';
import { HuntStatus, huntStatusNames } from '@/lib/constants';
import { AdminHunts } from '@/lib/hunt';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

interface HuntProps {
	hunt: HuntModel;
}

export function HuntList() {
	const { data: hunts, isLoading } = useQuery<AdminHunts>({
		queryFn: () => fetchFromApi('/admin/api/hunts'),
		queryKey: ['hunts'],
	});
	if (isLoading || !hunts) {
		return <HuntListLoading />;
	}
	return (
		<>
			{Object.entries(hunts).map(([status, typeHunts]) => (
				<section key={status}>
					<Header className="mb-4" level={3}>
						{huntStatusNames[status as HuntStatus]}
					</Header>
					<div className="grid grid-cols-3 gap-4">
						{typeHunts.map((hunt) => (
							<HuntCard hunt={hunt} key={hunt.id} />
						))}
					</div>
				</section>
			))}
		</>
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
		<Card>
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
							<Button className="rounded-full" size="icon">
								<Avatar hunter={hunter} />
							</Button>
						</li>
					))}
					{emptyAvatars}
				</ul>
			</CardContent>
		</Card>
	);
}

function HuntListLoading({ length = 3 }: { length?: number }) {
	const hunts = useMemo(() => Array.from(Array(length).keys()), [length]);
	return (
		<div className="grid grid-cols-3 gap-4">
			{hunts.map((index) => (
				<Card key={index}>
					<CardContent className="mt-6">
						<div className="aspect-square animate-pulse bg-stone-800 rounded-lg" />
						<ul className="flex gap-2 mt-2">
							<li>
								<AvatarEmpty />
							</li>
							<li>
								<AvatarEmpty />
							</li>
							<li>
								<AvatarEmpty />
							</li>
						</ul>
					</CardContent>
				</Card>
			))}
		</div>
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
