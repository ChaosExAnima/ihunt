import {
	BooleanField,
	Datagrid,
	List,
	NumberField,
	ReferenceField,
	TextField,
	useRecordContext,
} from 'react-admin';

import PhotoDisplay from '@/components/photo';

import { AdminAvatar } from '../components/avatar';
import { AdminPhotoSchema } from '../schemas';

export function PhotoList() {
	return (
		<List perPage={25}>
			<Datagrid
				expand={<PhotoExpand />}
				sort={{ field: 'id', order: 'ASC' }}
			>
				<TextField source="id" />
				<TextField source="path" />
				<NumberField source="width" />
				<NumberField source="height" />
				<BooleanField looseValue source="blurry" />
				<ReferenceField reference="hunter" source="hunterId">
					<AdminAvatar />
				</ReferenceField>
				<ReferenceField reference="hunt" source="huntId" />
			</Datagrid>
		</List>
	);
}

function PhotoExpand() {
	const record = useRecordContext<AdminPhotoSchema>();
	if (!record) {
		return null;
	}
	return (
		<PhotoDisplay
			height={record.height}
			photo={record}
			width={record.width}
		/>
	);
}
