import { Input } from '@/components/ui/input';
import { fetchCurrentUser } from '@/lib/user';

export default async function SettingsPage() {
	const user = await fetchCurrentUser();
	return (
		<div className="grid grid-cols-2 gap-4 items-center">
			<h1 className="text-4xl font-bold col-span-2">Settings</h1>
			<label htmlFor="name">Name</label>
			<Input value={user.name} id="name" />
			<label>Pronouns</label>
			<Input value="" />
		</div>
	);
}
