import { ReactNode, SyntheticEvent, useState } from 'react';
import {
	ArrayField,
	ArrayFieldProps,
	ChipField,
	Confirm,
	RaRecord,
	SingleFieldList,
	useRecordContext,
	useRefresh,
} from 'react-admin';

interface ChipListProps {
	empty?: ReactNode;
	fieldSource: string;
	isLoading?: boolean;
	onDelete?: (hunterId: number, huntId: number) => Promise<void>;
}

export default function ChipListField({
	empty,
	fieldSource,
	isLoading = false,
	onDelete,
	...props
}: ArrayFieldProps & ChipListProps) {
	const record = useRecordContext<RaRecord<number>>();
	return (
		<ArrayField {...props}>
			<SingleFieldList
				empty={
					empty ? (
						<em className="text-primary-foreground dark:text-secondary-foreground">
							{empty}
						</em>
					) : undefined
				}
			>
				{onDelete && record ? (
					<ChipFieldDeletable
						fieldSource={fieldSource}
						hunterId={record.id}
						isLoading={isLoading}
						onDelete={onDelete}
					/>
				) : (
					<ChipField source={fieldSource} />
				)}
			</SingleFieldList>
		</ArrayField>
	);
}

function ChipFieldDeletable({
	fieldSource,
	hunterId,
	isLoading,
	onDelete,
}: { hunterId: number } & Required<Omit<ChipListProps, 'empty'>>) {
	const record = useRecordContext<RaRecord<number>>();
	const [open, setOpen] = useState(false);
	const refresh = useRefresh();

	const handleConfirm = async () => {
		if (!record) {
			throw new Error('No record found!');
		}
		await onDelete(hunterId, record.id);
		refresh();
		setOpen(false);
	};
	const handleClick = (event: SyntheticEvent) => {
		event.preventDefault();
		setOpen(true);
	};
	return (
		<>
			<ChipField clickable onDelete={handleClick} source={fieldSource} />
			<Confirm
				content={`Are you sure?`}
				isOpen={open}
				loading={isLoading}
				onClose={() => setOpen(false)}
				onConfirm={handleConfirm}
				title={`Delete?`}
			/>
		</>
	);
}
