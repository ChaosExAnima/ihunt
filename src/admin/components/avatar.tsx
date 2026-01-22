import { FC, PropsWithChildren, useCallback } from 'react';
import {
	Button,
	DeleteButton,
	ReferenceField,
	ReferenceFieldProps,
	useRecordContext,
	useRefresh,
} from 'react-admin';

import { UploadPhoto } from '@/components/upload-photo';

import { useTypedDataProvider } from '../data';
import { AdminHunterSchema } from '../schemas';
import { AdminPhotoField } from './photo-field';

export const AdminAvatar: FC<
	Omit<ReferenceFieldProps, 'empty' | 'reference' | 'source'> & {
		size?: number;
	}
> = ({ size = 40, ...props }) => {
	const hunter = useRecordContext<AdminHunterSchema>();
	return (
		<ReferenceField
			empty={
				<span className="uppercase flex size-10 items-center justify-center rounded-full bg-muted">
					{hunter?.name.slice(0, 2)}
				</span>
			}
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
};

const AdminAvatarInnerInput: FC<PropsWithChildren> = ({ children }) => {
	return (
		<>
			<AdminPhotoField />
			<div className="flex gap-4 mt-4 justify-between">
				{children}
				<DeleteButton mutationMode="pessimistic" redirect={false}>
					Delete Avatar
				</DeleteButton>
			</div>
		</>
	);
};

function AdminAvatarInputUpload({
	create = false,
	hunterId,
}: {
	create?: boolean;
	hunterId: number;
}) {
	const refresh = useRefresh();

	const dataProvider = useTypedDataProvider();
	const handleCrop = useCallback(
		async (blob: Blob) => {
			const result = await dataProvider.uploadPhoto({ blob, hunterId });
			refresh();
			return !!result;
		},
		[dataProvider, hunterId, refresh],
	);
	return (
		<UploadPhoto
			button={<Button>{create ? 'Add avatar' : 'Replace avatar'}</Button>}
			circular
			onCrop={handleCrop}
			title="Avatar"
		/>
	);
}

export const AdminAvatarInput: FC = () => {
	const hunter = useRecordContext<AdminHunterSchema>();
	if (!hunter?.id) {
		return null;
	}
	if (hunter?.avatarId) {
		return (
			<ReferenceField reference="photo" source="avatarId">
				<AdminAvatarInnerInput>
					<AdminAvatarInputUpload hunterId={hunter.id} />
				</AdminAvatarInnerInput>
			</ReferenceField>
		);
	}
	return <AdminAvatarInputUpload create hunterId={hunter.id} />;
};
