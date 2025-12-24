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

export const AdminAvatarInput = () => (
	<ImageInput className="col-span-2" source="avatarId">
		<ReferenceField reference="photo" source="avatarId">
			<ImageField source="url" title="path" />
		</ReferenceField>
	</ImageInput>
);
