'use client';

import { Crosshair, Image, LogOut, Swords, UserRound } from 'lucide-react';
import { dataProvider } from 'ra-data-simple-prisma';
import { PropsWithChildren } from 'react';
import { Admin, Button, Layout, Menu, Resource } from 'react-admin';

import { logOut } from './actions';
import { HuntCreate, HuntEdit, HuntList } from './components/hunt';
import { HunterCreate, HunterEdit, HunterList } from './components/hunter';
import { PhotoList } from './components/photo';
import { UserEdit, UserList } from './components/user';

export default function AdminApp() {
	return (
		<Admin dataProvider={dataProvider('/admin/api')} layout={AdminLayout}>
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
				edit={UserEdit}
				icon={UserRound}
				list={UserList}
				name="user"
				options={{ label: 'Players' }}
				recordRepresentation={(record) => record.name ?? record.email}
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

function AdminLayout({ children }: PropsWithChildren) {
	return <Layout menu={AdminMenu}>{children}</Layout>;
}

function AdminMenu() {
	return (
		<Menu>
			<Menu.ResourceItems />
			<Button onClick={() => logOut()} sx={{ borderRadius: 0 }}>
				<LogOut />
			</Button>
		</Menu>
	);
}
