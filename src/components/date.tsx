import { useMemo } from 'react';

interface DateDisplayProps {
	date: Date | number;
}

export const MINUTE = 1000 * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
const OLD = DAY * 3;

export default function DateDisplay({ date }: DateDisplayProps) {
	const now = useMemo(() => Date.now(), []);
	if (date instanceof Date) {
		date = date.getTime();
	}

	const diff = now - date;
	if (diff >= OLD) {
		return 'a while ago';
	} else if (diff >= DAY) {
		if (diff >= DAY * 2) {
			return `${Math.floor(diff / DAY)} days ago`;
		}
		return 'a day ago';
	} else if (diff >= HOUR) {
		if (diff >= HOUR * 2) {
			return `${Math.floor(diff / HOUR)} hours ago`;
		}
		return 'an hour ago';
	}
	return 'now';
}
