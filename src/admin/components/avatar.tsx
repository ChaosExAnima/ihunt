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
import PhotoDisplay from '@/components/photo';
import UploadPhoto from '@/components/upload-photo';

import { AdminDataProvider } from '../data';
import { AdminHunterSchema, AdminPhotoSchema } from '../schemas';

function AdminAvatarInner({ size }: { size: number }) {
	const photo = useRecordContext<AdminPhotoSchema>();
	if (!photo) {
		return <AvatarEmpty />;
	}
	return (
		<PhotoDisplay
			className="rounded-full"
			fit="fill"
			height={size}
			photo={photo}
			width={size}
		/>
	);
}

export const AdminAvatar = ({
	size = 40,
	...props
}: Omit<ReferenceFieldProps, 'reference' | 'source'> & { size?: number }) => (
	<ReferenceField reference="photo" source="avatarId" {...props}>
		<AdminAvatarInner size={size} />
	</ReferenceField>
);

const AdminAvatarInnerInput: FC<{ hunterId?: number }> = ({ hunterId }) => {
	const photo = useRecordContext<AdminPhotoSchema>();
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

	if (!hunterId || !photo) {
		return null;
	}

	return (
		<>
			<PhotoDisplay photo={photo} />
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
