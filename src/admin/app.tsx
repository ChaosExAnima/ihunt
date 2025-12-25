import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Crosshair, Image, Swords, UserRound } from 'lucide-react';
import { Admin, DataProvider, Resource } from 'react-admin';

import { queryClient } from '@/lib/api';

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
				recordRepresentation="name"
			/>
			<Resource
				icon={Image}
				list={PhotoList}
				name="photo"
				recordRepresentation="id"
			/>
			<ReactQueryDevtools />
		</Admin>
	);
}
