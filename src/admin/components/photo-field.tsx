import { useRecordContext } from 'react-admin';

import PhotoDisplay, { PhotoDisplayProps } from '@/components/photo';

import { AdminPhotoSchema } from '../schemas';

export function AdminPhotoField(
	props: Omit<PhotoDisplayProps, 'photo'> & { photo?: AdminPhotoSchema },
) {
	const photo = useRecordContext({ record: props.photo });

	if (!photo) {
		return null;
	}

	return <PhotoDisplay {...props} photo={photo} />;
}
