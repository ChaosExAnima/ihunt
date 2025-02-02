'use client';

import { Crosshair, Image, Swords, UserRound } from 'lucide-react';
import { dataProvider } from 'ra-data-simple-prisma';
import { Admin, Resource } from 'react-admin';

import { HuntCreate, HuntEdit, HuntList } from './components/hunt';
import { HunterCreate, HunterEdit, HunterList } from './components/hunter';
import { PhotoList } from './components/photo';
import { UserEdit, UserList } from './components/user';

export default function AdminApp() {
	return (
		<Admin dataProvider={dataProvider('/admin/api')}>
			<Resource
				create={HunterCreate}
				edit={HunterEdit}
				icon={Swords}
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
			<Resource
				edit={UserEdit}
				icon={UserRound}
				list={UserList}
				name="user"
				recordRepresentation="email"
			/>
		</Admin>
	);
}
