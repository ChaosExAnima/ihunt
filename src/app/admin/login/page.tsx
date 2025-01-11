import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useActionState } from 'react';

import { logIn } from './actions';

export default function AdminPage() {
	const [state, formAction] = useActionState(logIn, {});
	return (
		<form action={formAction} className="self-center">
			<Header>Admin Login</Header>
			<label className="block mt-4 mb-2" htmlFor="password">
				Enter password:
			</label>
			<Input
				autoFocus
				className={cn(
					'max-w-80',
					state.success === false && 'border-red-700',
				)}
				id="password"
				name="password"
				required
				type="password"
			/>
			{state.success === false && (
				<p className="mt-2 text-red-700">Invalid password</p>
			)}
			<Button className="mt-4 bg-green-500" type="submit">
				Submit
			</Button>
		</form>
	);
}
