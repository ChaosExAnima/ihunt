import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function SettingsPage() {
	return (
		<>
			<Header level={1}>Settings</Header>
			<Button asChild variant="destructive">
				<Link href="/">Log out</Link>
			</Button>
		</>
	);
}
