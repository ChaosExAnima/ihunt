'use client';

import { Crosshair, Image, UserRound } from 'lucide-react';
import { dataProvider } from 'ra-data-simple-prisma';
import { Admin, Resource } from 'react-admin';

import { HuntCreate, HuntEdit, HuntList } from './components/hunt';
import { HunterCreate, HunterEdit, HunterList } from './components/hunter';
import { PhotoList } from './components/photo';

export default function AdminApp() {
	return (
		<Admin dataProvider={dataProvider('/admin/api')}>
			<Resource
				create={HunterCreate}
				edit={HunterEdit}
				icon={UserRound}
				list={HunterList}
				name="hunter"
				recordRepresentation="name"
			/>
			<Resource
				create={HuntCreate}
				edit={HuntEdit}
				icon={Crosshair}
				list={HuntList}
				name="hunt"
				recordRepresentation="name"
			/>
			<Resource
				icon={Image}
				list={PhotoList}
				name="photo"
				recordRepresentation="path"
			/>
		</Admin>
	);
}
