import { HunterRow } from '@/app/admin/api/hunter/route';
import {
	ArrayField,
	ChipField,
	Create,
	Datagrid,
	Edit,
	FunctionField,
	List,
	NumberField,
	NumberInput,
	SimpleForm,
	SingleFieldList,
	TextField,
	TextInput,
} from 'react-admin';

import PhotoDisplay from '../photo';

export function HunterCreate() {
	return (
		<Create>
			<SimpleForm>
				<TextInput source="name" />
			</SimpleForm>
		</Create>
	);
}

export function HunterEdit() {
	return (
		<Edit>
			<SimpleForm>
				<TextInput source="name" />
				<NumberInput source="money" />
			</SimpleForm>
		</Edit>
	);
}

export function HunterList() {
	return (
		<List>
			<Datagrid bulkActionButtons={false}>
				<TextField source="id" />
				<TextField source="name" />
				<FunctionField
					render={(record: HunterRow) =>
						record.avatar && (
							<div className="rounded-full size-10 overflow-hidden">
								<PhotoDisplay photo={record.avatar} />
							</div>
						)
					}
					sortable={false}
					source="avatar"
				/>
				<NumberField
					locales="de-DE"
					options={{
						currency: 'EUR',
						maximumFractionDigits: 0,
						style: 'currency',
					}}
					source="money"
					textAlign="left"
				/>
				<ArrayField label="Hunts" sortable={false} source="hunts">
					<SingleFieldList
						empty={
							<em className="text-primary-foreground dark:text-secondary-foreground">
								No hunts yet
							</em>
						}
					>
						<ChipField source="name" />
					</SingleFieldList>
				</ArrayField>
			</Datagrid>
		</List>
	);
}
