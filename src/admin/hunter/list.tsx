import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
	Datagrid,
	FunctionField,
	List,
	NumberField,
	SearchInput,
	TextField,
} from 'react-admin';

import Avatar from '@/components/avatar';
import { trpc } from '@/lib/api';
import { Locale } from '@/lib/constants';

import ChipListField from '../components/chip-list';
import { HunterRow } from './common';

const listFilters = [<SearchInput alwaysOn key="1" source="name" />];

export function HunterList() {
	const { isPending, mutateAsync } = useMutation(
		trpc.hunt.remove.mutationOptions(),
	);
	const handleDelete = useCallback(
		async (hunterId: number, huntId: number) => {
			await mutateAsync({ hunterId, huntId });
		},
		[],
	);
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
				<NumberField label="Rating" sortable={false} source="rating" />
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
