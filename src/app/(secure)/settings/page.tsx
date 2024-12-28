import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { fetchCurrentUser } from '@/lib/user';
import Link from 'next/link';

export default async function SettingsPage() {
	const user = await fetchCurrentUser();
	return (
		<>
			<Header>Settings</Header>
			<label>Name: {user.name}</label>
			<label>Email: {user.email}</label>
			<Button asChild variant="destructive">
				<Link href="/">Log out</Link>
			</Button>
		</>
	);
}
