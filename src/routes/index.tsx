import { useMutation } from '@tanstack/react-query';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { SubmitHandler, useForm } from 'react-hook-form';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/api';

/* eslint-disable perfectionist/sort-objects */
export const Route = createFileRoute('/')({
	validateSearch(search) {
		if (typeof search.redirect === 'string') {
			return {
				redirect: search.redirect,
			};
		}
		return {};
	},
	async beforeLoad({ context: { queryClient }, search }) {
		try {
			const player = await queryClient.fetchQuery(
				trpc.auth.me.queryOptions(),
			);
			if (player) {
				throw redirect({
					to: search.redirect ?? '/hunts',
				});
			}
		} catch {
			// Nothing
		}
	},
	component: Index,
});
/* eslint-enable perfectionist/sort-objects */

interface AuthForm {
	password: string;
}

function Index() {
	const router = useRouter();
	const { isPending, mutate } = useMutation(
		trpc.auth.logIn.mutationOptions({
			async onSuccess() {
				await router.navigate({ to: '/hunts' });
			},
		}),
	);
	const {
		formState: { errors },
		handleSubmit,
		register,
	} = useForm<AuthForm>();
	const onSubmit: SubmitHandler<AuthForm> = (data) => mutate(data);
	return (
		<main className="p-4 flex flex-col gap-4 grow">
			<Header className="text-center">iHunt</Header>
			<p className="text-xl text-center">
				Welcome to iHunt Alpha Access!
			</p>
			<p className="text-stone-600">Enter your login code below:</p>
			<form
				className="grow flex flex-col gap-4"
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				onSubmit={handleSubmit(onSubmit)}
			>
				<Input
					autoFocus
					{...register('password', { minLength: 3, required: true })}
					placeholder="Password"
					type="password"
				/>
				{errors.password && (
					<p className="text-rose-600 text-sm">
						{errors.password.type === 'minLength' &&
							'Passcode must be at least 3 characters.'}
						{errors.password.type === 'required' &&
							'Passcode is required.'}
					</p>
				)}
				<Button
					disabled={isPending}
					size="lg"
					type="submit"
					variant="success"
				>
					Log In
				</Button>
			</form>
			<p className="text-xs text-muted text-justify">
				No unauthorized use. If you have not been invited to install
				this application please immediately remove it from your device.
				Usage of this application does not constitute an endorsement of
				its content or purpose by iHunt or its affiliates. Misuse of
				this application or other violation of our terms of service may
				result in immediate app deletion, revocation of access, and/or
				potential legal action at iHunt's sole discretion.
			</p>
		</main>
	);
}
