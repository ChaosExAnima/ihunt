import { useCallback } from 'react';
import {
	Button,
	useDataProvider,
	useRecordContext,
	useRefresh,
} from 'react-admin';

import { UploadPhoto, UploadPhotoProps } from '@/components/upload-photo';
import { Entity } from '@/lib/types';

import { AdminDataProvider } from '../data';

export function AdminPhotoInput({
	type,
	...props
}: Omit<UploadPhotoProps, 'onCrop'> & { type: 'hunt' | 'hunter' }) {
	const record = useRecordContext<Entity>();
	const refresh = useRefresh();
	const dataProvider = useDataProvider<AdminDataProvider>();
	const handleCrop = useCallback(
		async (blob: Blob) => {
			if (!record?.id) {
				return false;
			}
			const result = await dataProvider.uploadPhoto({
				[`${type}Id`]: record.id,
				blob,
			});
			refresh();
			return !!result;
		},
		[dataProvider, refresh, record, type],
	);

	return (
		<UploadPhoto
			button={<Button>{props.title}</Button>}
			{...props}
			onSave={handleCrop}
		/>
	);
}
