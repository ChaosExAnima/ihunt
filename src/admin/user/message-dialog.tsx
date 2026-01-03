import { MessageSquare } from 'lucide-react';
import { FormEventHandler, useCallback, useState } from 'react';
import { Button, useListContext, useNotify } from 'react-admin';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { useTypedDataProvider } from '../data';
import { AdminUserSchema } from '../schemas';

export function MessageDialog() {
	const { selectedIds } = useListContext<AdminUserSchema>();

	const [open, setOpen] = useState(false);
	const handleOpenClose = useCallback((newOpen = false) => {
		setOpen(newOpen);
	}, []);

	const notify = useNotify();

	const { message } = useTypedDataProvider();
	const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
		(event) => {
			event.preventDefault();
			const data = new FormData(event.currentTarget);
			const title = data.get('title')?.valueOf();
			const body = data.get('body')?.valueOf();
			if (
				!title ||
				typeof title !== 'string' ||
				typeof body === 'object'
			) {
				notify('Invalid options provided', { type: 'error' });
				return;
			}
			void message({
				body,
				ids: selectedIds,
				title,
			})
				.then(({ sent }) => {
					notify(`Sent message to ${sent} player`, {
						type: 'success',
					});
				})
				.catch((err) => {
					console.error(err);
					notify('Error sending message', { type: 'error' });
				});
		},
		[message, notify, selectedIds],
	);

	return (
		<Dialog onOpenChange={handleOpenClose} open={open}>
			<DialogTrigger asChild>
				<Button
					label="Send message"
					startIcon={<MessageSquare fill="currentColor" size={16} />}
				>
					Send message
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Send a message to {selectedIds.length} players
					</DialogTitle>
				</DialogHeader>
				<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
					<Input name="title" placeholder="Title" required />
					<Textarea name="body" placeholder="Body" />
					<Button type="submit">Submit</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
