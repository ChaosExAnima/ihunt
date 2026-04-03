import { SubmitEventHandler, useCallback } from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';

import { ACCESS_CODE_CHAR_COUNT, ACCESS_CODE_REGEX } from '@/lib/constants';
import { AuthSchema } from '@/lib/schemas';

import { Button } from './ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from './ui/form';
import { Input } from './ui/input';

export function LoginForm({
	onSubmit,
	form,
	disabled,
}: {
	onSubmit: SubmitHandler<AuthSchema>;
	form: UseFormReturn<AuthSchema>;
	disabled?: boolean;
}) {
	const handleSubmit: SubmitEventHandler = useCallback(
		(event) => {
			event.preventDefault();
			const submit = form.handleSubmit(onSubmit);
			void submit(event);
		},
		[onSubmit, form],
	);

	return (
		<Form {...form}>
			<form
				className="flex w-full grow flex-col gap-4"
				onSubmit={handleSubmit}
			>
				<FormField
					control={form.control}
					name="code"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="block text-lg">
								Access Code
							</FormLabel>
							<FormControl>
								<Input
									type="text"
									placeholder="A99"
									className="h-10 text-xl uppercase"
									maxLength={ACCESS_CODE_CHAR_COUNT}
									pattern={ACCESS_CODE_REGEX.source}
									data-1p-ignore
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="block text-lg">
								Password
							</FormLabel>
							<FormControl>
								<Input
									type="password"
									className="h-10 text-xl"
									autoComplete="current-password"
									data-1p-ignore
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					disabled={disabled}
					size="lg"
					type="submit"
					variant="success"
				>
					Log In
				</Button>
			</form>
		</Form>
	);
}
