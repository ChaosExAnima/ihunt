import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from '@radix-ui/react-dialog';
import { Check } from 'lucide-react';
import { ChangeEvent, FormEventHandler, useState } from 'react';
import {
	IconButtonWithTooltip,
	useRecordContext,
	useUpdate,
} from 'react-admin';

import { Button } from '@/components/ui/button';
import { DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HuntStatus } from '@/lib/constants';
import { useCurrencyFormat } from '@/lib/formats';
import { HuntSchema } from '@/lib/schemas';

export default function HuntCompleteDialog() {
	const hunt = useRecordContext<HuntSchema>();
	const [modalOpen, setModalOpen] = useState(false);
	const [modalData, setModalData] = useState({
		comment: '',
		payment: hunt?.payment ?? 0,
		rating: 1,
	});
	const [update, { isLoading }] = useUpdate<HuntSchema>();

	const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault();
		update('hunt', {
			data: {
				...modalData,
				completedAt: new Date(),
				status: HuntStatus.Complete,
			},
			id: hunt?.id,
		});
	};
	const createFieldHandler =
		(field: keyof typeof modalData) =>
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			setModalData((prevData) => ({
				...prevData,
				[field]:
					field === 'comment'
						? event.target.value
						: parseFloat(event.target.value),
			}));

	const formattedPayment = useCurrencyFormat(modalData.payment);

	return (
		<Dialog onOpenChange={setModalOpen} open={modalOpen}>
			<DialogTrigger asChild>
				<IconButtonWithTooltip label="Complete">
					<Check />
				</IconButtonWithTooltip>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Complete hunt</DialogTitle>
				</DialogHeader>
				<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
					<p>
						{`You are paying the hunter ${formattedPayment}.`}
					</p>
					<Input
						min={0}
						onChange={createFieldHandler('payment')}
						step={10}
						type="number"
						value={modalData.payment}
					/>
					<p>Rate your hunters: {modalData.rating}</p>
					<Input
						max={5}
						min={1}
						onChange={createFieldHandler('rating')}
						step={0.5}
						type="range"
						value={modalData.rating}
					/>
					<p>Leave a comment:</p>
					<Textarea
						onChange={createFieldHandler('comment')}
						placeholder="Complain or praise your hunters"
						value={modalData.comment}
					/>
					<Button
						disabled={isLoading}
						type="submit"
						variant="success"
					>
						Complete
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
