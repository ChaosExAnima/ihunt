import { FC } from 'react';
import {
	DeleteButton,
	RecordContext,
	ReferenceField,
	useChoicesContext,
} from 'react-admin';

import { PropsWithClassName } from '@/lib/types';
import { cn } from '@/lib/utils';

import { AdminPhotoSchema } from '../schemas';
import { AdminPhotoField } from './photo-field';

export const AdminPhotoList: FC<PropsWithClassName> = ({ className }) => {
	const { selectedChoices: photos } = useChoicesContext<AdminPhotoSchema>();

	if (!photos?.length) {
		return null;
	}

	return (
		<ul className={cn('grid grid-cols-4 gap-4', className)}>
			{photos.map((photo) => (
				<li key={photo.id}>
					<RecordContext value={photo}>
						<AdminPhotoField />
						<div className="flex gap-2 mt-2 items-center">
							<ReferenceField
								reference="hunter"
								source="hunterId"
							/>
							<DeleteButton redirect={false} resource="photo" />
						</div>
					</RecordContext>
				</li>
			))}
		</ul>
	);
};
