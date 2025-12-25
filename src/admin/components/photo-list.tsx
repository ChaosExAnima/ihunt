import { FC } from 'react';
import { DeleteButton, useChoicesContext } from 'react-admin';

import PhotoDisplay from '@/components/photo';
import { PropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';

import { AdminPhotoSchema } from '../schemas';

export const AdminPhotoList: FC<PropsWithClassName> = ({ className }) => {
	const { selectedChoices: photos } = useChoicesContext<AdminPhotoSchema>();

	if (!photos) {
		return null;
	}

	return (
		<ul className={cn('grid grid-cols-4 gap-4', className)}>
			{photos.map((photo) => (
				<li className="flex flex-col gap-2" key={photo.id}>
					<PhotoDisplay photo={photo} />
					<DeleteButton
						record={photo}
						redirect={false}
						resource="photo"
					/>
				</li>
			))}
		</ul>
	);
};
