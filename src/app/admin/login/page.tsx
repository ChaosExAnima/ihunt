'use client';

import { useActionState } from 'react';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { logIn } from './actions';

export default function AdminPage() {
	const [state, formAction] = useActionState(logIn, {});
	return (
		<form action={formAction} className="self-center mt-10">
			<Header>Admin Login</Header>
			<label className="block mt-4 mb-2" htmlFor="password">
				Enter password:
			</label>
			<div className="flex gap-2">
				<Input
					autoFocus
					className={cn(
						'max-w-80',
						state.success === false && 'border-red-700',
					)}
					id="password"
					name="password"
					placeholder="Admin password"
					required
					type="password"
				/>
				<Button type="submit" variant="success">
					Submit
				</Button>
			</div>
			{state.success === false && (
				<p className="my-2 text-red-700">Invalid password</p>
			)}
		</form>
	);
}
