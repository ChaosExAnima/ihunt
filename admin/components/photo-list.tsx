import { cn } from '@ihunt/client/lib/styles';
import { PropsWithClassName } from '@ihunt/client/lib/types';
import { AdminPhotoSchema } from '@ihunt/lib/admin-schemas';
import { FC } from 'react';
import {
	DeleteButton,
	RecordContext,
	ReferenceField,
	useChoicesContext,
} from 'react-admin';

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
						<div className="mt-2 flex items-center gap-2">
							<ReferenceField reference="hunter" source="hunterId" />
							<DeleteButton redirect={false} resource="photo" />
						</div>
					</RecordContext>
				</li>
			))}
		</ul>
	);
};
