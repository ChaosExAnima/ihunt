import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
	createFileRoute,
	Link,
	redirect,
	useRouter,
} from '@tanstack/react-router';
import { isTRPCClientError } from '@trpc/client';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { Header } from '@/components/header';
import { LoginForm } from '@/components/login';
import { trpc } from '@/lib/api';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import { authSchema, AuthSchema } from '@/lib/schemas';

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
		const session = Cookies.get(SESSION_COOKIE_NAME);
		if (!session) {
			return;
		}
		try {
			const player = await queryClient.fetchQuery(
				trpc.auth.me.queryOptions(),
			);

			if (player) {
				throw redirect({
					to: search.redirect ?? '/hunts',
				});
			}
		} catch (err) {
			if (isTRPCClientError(err) && err.message === 'UNAUTHORIZED') {
				Cookies.remove(SESSION_COOKIE_NAME);
			}

			if (err instanceof Response) {
				throw err;
			}
		}
	},
	component: Index,
});

function Index() {
	const router = useRouter();
	const { mutate, reset } = useMutation(
		trpc.auth.logIn.mutationOptions({
			async onSuccess() {
				await router.navigate({ to: '/hunts' });
			},
			onError(error) {
				const { message } = error;
				form.setError(message.includes('code') ? 'code' : 'password', {
					message,
				});
			},
		}),
	);
	const handleLogin: SubmitHandler<AuthSchema> = (data) => {
		mutate(data);
	};
	const form = useForm<AuthSchema>({
		defaultValues: {
			password: '',
		},
		resolver: zodResolver(authSchema),
	});

	useEffect(() => {
		reset();
	}, [reset]);

	return (
		<main className="flex grow flex-col gap-4 p-4">
			<Header className="text-center">iHunt Alpha Access</Header>
			<Header level={2} className="text-2xl">
				Hunter login
			</Header>
			<LoginForm onSubmit={handleLogin} form={form} />
			<Link to="/debug" className="text-muted text-sm">
				Debug info
			</Link>
			<p className="text-muted text-justify text-xs">
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
