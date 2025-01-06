import Link from 'next/link';

import { HuntProps } from '.';
import Avatar from '../avatar';
import { HuntModel } from './consts';

export default function HuntHuntersDisplay({
	hunterId,
	hunters,
	isAccepted = false,
	maxHunters,
}: { isAccepted?: boolean } & Pick<HuntModel, 'hunters' | 'maxHunters'> &
	Pick<HuntProps, 'hunterId'>) {
	const spotsRemaining = maxHunters - hunters.length;
	return (
		<>
			{hunters.length > 0 && (
				<ul className="flex gap-4 items-center mb-4">
					<li>Hunters:</li>
					{hunters.map((hunter) => (
						<li key={hunter.id}>
							<Link
								href={
									hunter.id === hunterId
										? '/settings'
										: `/hunters/${hunter.id}`
								}
							>
								<Avatar hunter={hunter} />
							</Link>
						</li>
					))}
				</ul>
			)}
			{spotsRemaining > 0 && !isAccepted && (
				<p className="my-2 font-bold text-center">
					{spotsRemaining} spot{spotsRemaining > 1 && 's'} remaining!
				</p>
			)}
		</>
	);
}
