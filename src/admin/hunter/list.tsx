import { useMutation } from '@tanstack/react-query';
import {
	Datagrid,
	FunctionField,
	List,
	NumberField,
	SearchInput,
	TextField,
} from 'react-admin';

import Avatar from '@/components/avatar';
import { fetchFromApi } from '@/lib/api';
import { Locale } from '@/lib/constants';

import ChipListField from '../components/chip-list';
import { HunterRow } from './common';

const listFilters = [<SearchInput alwaysOn key="1" source="name" />];

export function HunterList() {
	const { isPending, mutate } = useMutation({
		mutationFn: ({
			hunterId,
			huntId,
		}: {
			hunterId: number;
			huntId: number;
		}) =>
			fetchFromApi('/admin/api/hunt/hunters', {
				body: {
					hunterId,
					huntId,
				},
				method: 'DELETE',
			}),
	});
	const handleDelete = async (hunterId: number, huntId: number) => {
		await mutate({ hunterId, huntId });
	};
	return (
		<List filters={listFilters}>
			<Datagrid
				bulkActionButtons={false}
				sort={{ field: 'id', order: 'ASC' }}
			>
				<TextField source="id" />
				<TextField source="name" />
				<FunctionField
					render={(record: HunterRow) => <Avatar hunter={record} />}
					sortable={false}
					source="avatar"
				/>
				<FunctionField
					label="Rating"
					render={ratingField}
					sortable={false}
				/>
				<NumberField
					locales={Locale}
					options={{
						currency: 'EUR',
						maximumFractionDigits: 0,
						style: 'currency',
					}}
					source="money"
					textAlign="left"
				/>
				<ChipListField
					empty="No hunts yet"
					fieldSource="name"
					isLoading={isPending}
					label="Hunts"
					onDelete={handleDelete}
					sortable={false}
					source="hunts"
				/>
			</Datagrid>
		</List>
	);
}

const numberFormatter = new Intl.NumberFormat(Locale, {
	minimumFractionDigits: 1,
});

function ratingField(record: HunterRow) {
	return numberFormatter.format(
		record.hunts.reduce(
			(rating, hunt) => (hunt.rating ? rating + hunt.rating : rating),
			0,
		),
	);
}
