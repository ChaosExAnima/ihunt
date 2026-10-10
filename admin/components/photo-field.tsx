import {
	PhotoDisplay,
	PhotoDisplayProps,
} from '@ihunt/client/components/photo';
import { AdminPhotoSchema } from '@ihunt/lib/admin-schemas';
import { useRecordContext } from 'react-admin';

export function AdminPhotoField(
	props: Omit<PhotoDisplayProps, 'photo'> & { photo?: AdminPhotoSchema },
) {
	const photo = useRecordContext({ record: props.photo });

	if (!photo) {
		return null;
	}

	return <PhotoDisplay {...props} photo={photo} />;
}
