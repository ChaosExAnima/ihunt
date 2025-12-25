import { FC, useCallback } from 'react';
import {
	Button,
	DeleteButton,
	ReferenceField,
	ReferenceFieldProps,
	useDataProvider,
	useRecordContext,
	useRefresh,
} from 'react-admin';

import { AvatarEmpty } from '@/components/avatar';
import UploadPhoto from '@/components/upload-photo';

import { AdminDataProvider } from '../data';
import { AdminHunterSchema } from '../schemas';
import { AdminPhotoField } from './photo-field';

export const AdminAvatar = ({
	size = 40,
	...props
}: Omit<ReferenceFieldProps, 'empty' | 'reference' | 'source'> & {
	size?: number;
}) => (
	<ReferenceField
		empty={<AvatarEmpty />}
		reference="photo"
		source="avatarId"
		{...props}
	>
		<AdminPhotoField
			className="rounded-full"
			fit="fill"
			height={size}
			width={size}
		/>
	</ReferenceField>
);

const AdminAvatarInnerInput: FC<{ hunterId?: number }> = ({ hunterId }) => {
	const refresh = useRefresh();

	const dataProvider = useDataProvider<AdminDataProvider>();
	const handleCrop = useCallback(
		async (blob: Blob) => {
			const result = await dataProvider.uploadPhoto({ blob, hunterId });
			refresh();
			return !!result;
		},
		[dataProvider, refresh],
	);

	if (!hunterId) {
		return null;
	}

	return (
		<>
			<AdminPhotoField />
			<div className="flex gap-4 mt-4 justify-between">
				<UploadPhoto
					button={<Button>Replace</Button>}
					circular
					onCrop={handleCrop}
					title="Avatar"
				/>
				<DeleteButton mutationMode="pessimistic" redirect={false}>
					Delete Avatar
				</DeleteButton>
			</div>
		</>
	);
};

export const AdminAvatarInput: FC = () => {
	const hunter = useRecordContext<AdminHunterSchema>();
	return (
		<ReferenceField reference="photo" source="avatarId">
			<AdminAvatarInnerInput hunterId={hunter?.id} />
		</ReferenceField>
	);
};
