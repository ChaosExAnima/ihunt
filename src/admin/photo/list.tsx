import { Photo } from '@prisma/client';
import {
	BooleanField,
	Datagrid,
	FunctionField,
	List,
	NumberField,
	ReferenceField,
	TextField,
	useRecordContext,
} from 'react-admin';

import PhotoDisplay from '@/components/photo';

import { AdminHunter } from '../components/hunter-list';

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
				<FunctionField
					render={(record) => <AdminHunter hunter={record?.hunter} />}
					source="hunter"
				/>
				<ReferenceField reference="hunt" source="huntId" />
			</Datagrid>
		</List>
	);
}

function PhotoExpand() {
	const record = useRecordContext<Photo>();
	if (!record) {
		return null;
	}
	return <PhotoDisplay photo={record} />;
}
