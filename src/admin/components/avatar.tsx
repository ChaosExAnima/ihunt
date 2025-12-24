import {
	ImageField,
	ImageInput,
	ReferenceField,
	ReferenceFieldProps,
	useRecordContext,
} from 'react-admin';

import { AvatarEmpty } from '@/components/avatar';
import PhotoDisplay from '@/components/photo';

import { AdminPhotoSchema } from '../schemas';

function AdminAvatarInner() {
	const photo = useRecordContext<AdminPhotoSchema>();
	if (!photo) {
		return <AvatarEmpty />;
	}
	return (
		<PhotoDisplay
			className="rounded-full"
			fit="fill"
			height={40}
			photo={photo}
			width={40}
		/>
	);
}

export const AdminAvatar = (
	props: Omit<ReferenceFieldProps, 'reference' | 'source'>,
) => (
	<ReferenceField reference="photo" source="avatarId" {...props}>
		<AdminAvatarInner />
	</ReferenceField>
);

export const AdminAvatarInput = () => (
	<ImageInput className="col-span-2" source="avatarId">
		<ReferenceField reference="photo" source="avatarId">
			<ImageField source="url" title="path" />
		</ReferenceField>
	</ImageInput>
);
