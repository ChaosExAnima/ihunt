import {
	BooleanField,
	Datagrid,
	FunctionField,
	Link,
	List,
	NumberField,
	ReferenceField,
	ReferenceInput,
	TextField,
	useRecordContext,
} from 'react-admin';

import PhotoDisplay from '@/components/photo';

import { AdminAvatar } from '../components/avatar';
import { AdminPhotoSchema } from '../schemas';

const queryFilter = [
	<ReferenceInput key="hunterId" reference="hunter" source="hunterId" />,
	<ReferenceInput key="huntId" reference="hunt" source="huntId" />,
];

export function PhotoList() {
	return (
		<List
			filters={queryFilter}
			perPage={25}
			queryOptions={{ meta: { showAll: true } }}
		>
			<Datagrid
				expand={<PhotoExpand />}
				sort={{ field: 'id', order: 'ASC' }}
			>
				<TextField source="id" />
				<FunctionField
					label="Name"
					render={(record: AdminPhotoSchema) => (
						<Link target="_blank" to={record.url}>
							<TextField source="path" />
						</Link>
					)}
					sortable={false}
				/>
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
		<Link target="_blank" to={record.url}>
			<PhotoDisplay
				height={record.height}
				photo={record}
				width={record.width}
			/>
		</Link>
	);
}
