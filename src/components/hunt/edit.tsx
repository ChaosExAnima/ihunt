'use client';

import { huntStatus, HuntStatus } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { HuntProps } from '.';
import { Button } from '../ui/button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { HuntModel } from './consts';

const huntSchema = z.object({
	description: z.string(),
	maxHunters: z.coerce.number().int().positive(),
	minRating: z.coerce.number().int().min(1).max(5),
	name: z.string(),
	status: z.nativeEnum(HuntStatus),
});
export type EditHuntAction = (
	values: HuntSchema,
	hunt: HuntModel,
) => Promise<void>;

export type HuntSchema = z.infer<typeof huntSchema>;

interface EditHuntProps extends Omit<HuntProps, 'hunterId'> {
	backHref: string;
	saveAction: EditHuntAction;
}

export default function EditHunt({
	backHref,
	className,
	hunt,
	saveAction,
}: EditHuntProps) {
	const form = useForm<HuntSchema>({
		defaultValues: {
			...hunt,
			status: huntStatus.parse(hunt.status),
		},
		resolver: zodResolver(huntSchema),
	});
	const handleSubmit = async (values: HuntSchema) => {
		await saveAction(values, hunt);
	};
	const isDone =
		hunt.status === HuntStatus.Active ||
		hunt.status === HuntStatus.Complete;
	return (
		<Form {...form}>
			<form
				className={cn(className)}
				onSubmit={form.handleSubmit(handleSubmit)}
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input {...field} required type="text" />
							</FormControl>
							<FormDescription>
								{fieldState.error?.message}
							</FormDescription>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea {...field} required />
							</FormControl>
							<FormDescription>
								{fieldState.error?.message}
							</FormDescription>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="maxHunters"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>Max Hunters</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled={isDone}
									min={0}
									required
									type="number"
								/>
							</FormControl>
							<FormDescription>
								{fieldState.error?.message}
							</FormDescription>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="minRating"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>Min Rating</FormLabel>
							<FormControl>
								<Input
									{...field}
									disabled={isDone}
									max={5}
									min={1}
									required
									step={0.5}
									type="number"
								/>
							</FormControl>
							<FormDescription>
								{fieldState.error?.message}
							</FormDescription>
						</FormItem>
					)}
				/>
				<div className="flex gap-4 mt-4 justify-end">
					<Link href={backHref}>
						<Button variant="secondary">
							<X />
							Cancel
						</Button>
					</Link>
					<Button type="submit" variant="success">
						<Save />
						Save
					</Button>
				</div>
			</form>
		</Form>
	);
}
