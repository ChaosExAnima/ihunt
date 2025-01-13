'use client';

import { dataProvider } from 'ra-data-simple-prisma';
import { Admin, EditGuesser, ListGuesser, Resource } from 'react-admin';

import HunterList from './hunter-list';

export default function AdminApp() {
	return (
		<Admin dataProvider={dataProvider('/admin/api')}>
			<Resource
				edit={EditGuesser}
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
