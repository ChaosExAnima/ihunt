import { User } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { Crosshair, Image, LogOut, Swords, UserRound } from 'lucide-react';
import { PropsWithChildren } from 'react';
import {
	Admin,
	Button,
	DataProvider,
	Layout,
	Menu,
	Resource,
} from 'react-admin';

import { queryClient, trpc } from '@/lib/api';

import { LoginPage } from './components/login';
import { authProvider, dataProvider } from './data';
import { HuntCreate } from './hunt/create';
import { HuntEdit } from './hunt/edit';
import { HuntList } from './hunt/list';
import { HunterCreate } from './hunter/create';
import { HunterEdit } from './hunter/edit';
import { HunterList } from './hunter/list';
import { PhotoList } from './photo/list';
import { UserEdit } from './user/edit';
import { UserList } from './user/list';

export function App() {
	return (
		<Admin
			authProvider={authProvider}
			dataProvider={dataProvider as DataProvider<string>}
			layout={AdminLayout}
			loginPage={LoginPage}
			queryClient={queryClient}
		>
			<Resource
				create={HuntCreate}
				edit={HuntEdit}
				icon={Crosshair}
				list={HuntList}
				name="hunt"
				recordRepresentation="name"
			/>
			<Resource
				create={HunterCreate}
				edit={HunterEdit}
				icon={Swords}
				list={HunterList}
				name="hunter"
				recordRepresentation="handle"
			/>
			<Resource
				edit={UserEdit}
				icon={UserRound}
				list={UserList}
				name="user"
				options={{ label: 'Players' }}
				recordRepresentation={(record: User) =>
					record.name ?? 'Unknown User'
				}
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
	const { mutate } = useMutation(trpc.auth.logOut.mutationOptions());
	return (
		<Menu>
			<Menu.ResourceItems />
			<Button onClick={() => mutate()} sx={{ borderRadius: 0 }}>
				<LogOut />
			</Button>
		</Menu>
	);
}
