'use client';

import { dataProvider } from 'ra-data-simple-prisma';
import { Admin, EditGuesser, ListGuesser, Resource } from 'react-admin';

import { HunterCreate, HunterEdit, HunterList } from './hunter';

export default function AdminApp() {
	return (
		<Admin dataProvider={dataProvider('/admin/api')}>
			<Resource
				create={HunterCreate}
				edit={HunterEdit}
				list={HunterList}
				name="hunter"
				recordRepresentation="name"
			/>
			<Resource
				edit={EditGuesser}
				list={ListGuesser}
				name="hunt"
				recordRepresentation="name"
			/>
		</Admin>
	);
}
