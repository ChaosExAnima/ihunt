import { useDateFormat } from '@/lib/formats';

interface DateDisplayProps {
	date: Date | number;
}

export default function DateDisplay({ date }: DateDisplayProps) {
	const reallyDate = date instanceof Date ? date : new Date(date);
	return useDateFormat(reallyDate);
}
