import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { SubmitHandler, useForm } from 'react-hook-form';
import z from 'zod';

import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from '@/components/ui/input-otp';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { trpc } from '@/lib/api';
import { PASSWORD_CHAR_COUNT, SESSION_COOKIE_NAME } from '@/lib/constants';
import { authSchema } from '@/lib/schemas';

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
			const session = await cookieStore.get(SESSION_COOKIE_NAME);
			if (!session) {
				return;
			}
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

function Index() {
	const router = useRouter();
	const { isPending, mutate } = useMutation(
		trpc.auth.logIn.mutationOptions({
			onError() {
				form.setError('password', { message: 'Code not found' });
				form.setFocus('password');
			},
			async onSuccess() {
				await router.navigate({ to: '/hunts' });
			},
		}),
	);
	const form = useForm<z.infer<typeof authSchema>>({
		defaultValues: {
			password: '',
		},
		resolver: zodResolver(authSchema),
	});
	const onSubmit: SubmitHandler<z.infer<typeof authSchema>> = (data) =>
		mutate(data);

	return (
		<main className="p-4 flex flex-col gap-4 grow">
			<Header className="text-center">iHunt Alpha Access</Header>
			<Form {...form}>
				<form
					className="grow w-full flex flex-col gap-4"
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormDescription className="text-center">
									Enter your login code below:
								</FormDescription>
								<FormControl>
									<InputOTP
										autoFocus
										containerClassName="justify-center"
										maxLength={PASSWORD_CHAR_COUNT}
										pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
										{...field}
									>
										<InputOTPGroup className="w-full">
											{[
												...Array(PASSWORD_CHAR_COUNT),
											].map((_, index) => (
												<InputOTPSlot
													className="w-[calc(100%/6)] h-12"
													index={index}
													key={index}
												/>
											))}
										</InputOTPGroup>
									</InputOTP>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						disabled={isPending || !form.formState.isValid}
						size="lg"
						type="submit"
						variant="success"
					>
						Log In
					</Button>
					<Popover>
						<PopoverTrigger className="text-xs text-muted-foreground text-center cursor-pointer hover:underline">
							Forgot your code? Click here for help!
						</PopoverTrigger>
						<PopoverContent className="text-sm/relaxed">
							OC: Your login code is the first six characters of
							your character&rsquo;s handle. For example: If your
							character&rsquo;s handle is{' '}
							<strong>darkknight666</strong>, your login code
							is&nbsp;
							<code className="border border-muted p-1 rounded-sm">
								darkkn
							</code>
							.
						</PopoverContent>
					</Popover>
				</form>
			</Form>
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
