import Link from 'next/link';
import { useMemo } from 'react';

import Avatar, { AvatarEmpty, AvatarHunter } from './avatar';

interface HunterListProps {
	currentHunterId?: number;
	hunters: AvatarHunter[];
	max?: number;
}

export default function HunterList({
	currentHunterId,
	hunters,
	max,
}: HunterListProps) {
	const emptyAvatars = useMemo(() => {
		if (!max || max <= hunters.length) {
			return null;
		}
		return Array.from(Array(max - hunters.length)).map((_, index) => (
			<li key={index}>
				<AvatarEmpty />
			</li>
		));
	}, [max, hunters.length]);

	return (
		<ul className="flex gap-2">
			{hunters.map((hunter) => (
				<li key={hunter.id}>
					<Link
						href={
							hunter.id === currentHunterId
								? '/settings'
								: `/hunters/${hunter.id}`
						}
					>
						<Avatar hunter={hunter} />
					</Link>
				</li>
			))}
			{emptyAvatars}
		</ul>
	);
}
