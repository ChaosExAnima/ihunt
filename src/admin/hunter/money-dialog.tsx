import { BadgeEuro } from 'lucide-react';
import {
	ChangeEventHandler,
	FormEventHandler,
	useCallback,
	useState,
} from 'react';
import {
	Button,
	IconButtonWithTooltip,
	useRecordContext,
	useUpdate,
} from 'react-admin';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

import { AdminHunterSchema } from '../schemas';

export function MoneyDialog() {
	const hunter = useRecordContext<AdminHunterSchema>();

	const [mode, setMode] = useState<'add' | 'subtract'>('subtract');
	const handleSetMode = useCallback((value: string) => {
		setMode(value === 'add' ? 'add' : 'subtract');
	}, []);

	const [amount, setAmount] = useState(0);
	const handleSetAmount: ChangeEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			event.preventDefault();
			setAmount(event.target.valueAsNumber);
		},
		[],
	);

	const [open, setOpen] = useState(false);
	const handleOpenClose = useCallback((newOpen = false) => {
		setOpen(newOpen);
		setMode('subtract');
		setAmount(0);
	}, []);

	const [update, { isPending }] = useUpdate<AdminHunterSchema>();
	const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(
		(event) => {
			event.preventDefault();
			if (!hunter) {
				return;
			}
			const money =
				hunter.money + (mode === 'subtract' ? -1 : 1) * amount;
			void update('hunter', {
				data: {
					money,
				},
				id: hunter.id,
			});
			handleOpenClose();
		},
		[amount, handleOpenClose, hunter, mode, update],
	);

	if (!hunter?.alive) {
		return null;
	}

	return (
		<Dialog onOpenChange={handleOpenClose} open={open}>
			<DialogTrigger>
				<IconButtonWithTooltip label="Pay money">
					<BadgeEuro />
				</IconButtonWithTooltip>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === 'subtract'
							? 'Taking money from '
							: 'Giving money to '}
						{hunter.handle}
					</DialogTitle>
				</DialogHeader>
				<form className="flex flex-col gap-2" onSubmit={handleSubmit}>
					<div className="flex gap-2">
						<Select onValueChange={handleSetMode} value={mode}>
							<SelectTrigger className="w-20">
								<SelectValue placeholder="Mode" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="subtract">-</SelectItem>
								<SelectItem value="add">+</SelectItem>
							</SelectContent>
						</Select>
						<Input
							autoFocus
							className="grow"
							min={0}
							onChange={handleSetAmount}
							step={10}
							type="number"
							value={amount}
						/>
					</div>
					<Button disabled={isPending} type="submit">
						Submit
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
