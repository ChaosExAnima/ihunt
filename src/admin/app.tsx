import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Crosshair, Image, Swords, UserRound, UsersRound } from 'lucide-react';
import { tanStackRouterProvider } from 'ra-router-tanstack';
import { ReactNode, useEffect } from 'react';
import { StrictMode } from 'react';
import {
	Admin,
	CustomRoutes,
	DataProvider,
	Layout,
	Resource,
	useTheme,
} from 'react-admin';
import { createRoot } from 'react-dom/client';

import { queryClient } from '@/lib/api';

import { LoginPage } from './components/login';
import { authProvider, dataProvider } from './data';
import { GroupCreate } from './group/create';
import { GroupEdit } from './group/edit';
import { GroupList } from './group/list';
import { HuntCreate } from './hunt/create';
import { HuntEdit } from './hunt/edit';
import { HuntList } from './hunt/list';
import { HunterCreate } from './hunter/create';
import { HunterEdit } from './hunter/edit';
import { HunterList } from './hunter/list';
import { PhotoList } from './photo/list';
import { ReviewWall } from './review-wall';
import { AdminUserSchema } from './schemas';
import { UserCreate } from './user/create';
import { UserEdit } from './user/edit';
import { UserList } from './user/list';

const { Route } = tanStackRouterProvider;

function App() {
	return (
		<Admin
			disableTelemetry
			layout={CustomLayout}
			authProvider={authProvider}
			dataProvider={dataProvider as DataProvider<string>}
			loginPage={LoginPage}
			queryClient={queryClient}
			routerProvider={tanStackRouterProvider}
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
				create={GroupCreate}
				edit={GroupEdit}
				icon={UsersRound}
				list={GroupList}
				name="group"
				recordRepresentation="name"
			/>
			<Resource
				create={UserCreate}
				edit={UserEdit}
				icon={UserRound}
				list={UserList}
				name="user"
				options={{ label: 'Players' }}
				recordRepresentation={(record: AdminUserSchema) =>
					record.code.toUpperCase()
				}
			/>
			<Resource
				icon={Image}
				list={PhotoList}
				name="photo"
				recordRepresentation="id"
			/>
			<CustomRoutes noLayout>
				<Route path="/wall" element={<ReviewWall />} />
			</CustomRoutes>
		</Admin>
	);
}

function CustomLayout({ children }: { children: ReactNode }) {
	const [theme] = useTheme();
	useEffect(() => {
		if (theme === 'dark') {
			document.body.classList.add('dark');
		} else {
			document.body.classList.remove('dark');
		}
	}, [theme]);
	return (
		<Layout>
			{children}
			<ReactQueryDevtools />
		</Layout>
	);
}

function start() {
	const rootElement = document.getElementById('root')!;
	if (!rootElement.innerHTML) {
		const root = createRoot(rootElement);
		root.render(
			<StrictMode>
				<App />
			</StrictMode>,
		);
	}
}

start();
