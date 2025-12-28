import { useMemo } from 'react';

import { usePlayerSettings } from '@/components/providers/player';

import { Currency, Locale } from './constants';

// Dates and times
export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const OLD = DAY * 3;

export const currencyFormatter = new Intl.NumberFormat(Locale, {
	currency: Currency,
	maximumFractionDigits: 0,
	style: 'currency',
});

export function dateFormat(date: Date) {
	const now = Date.now();
	const diff = now - date.getTime();
	if (diff >= OLD) {
		return 'a while ago';
	} else if (diff >= DAY) {
		if (diff >= DAY * 2) {
			return `${Math.floor(diff / DAY)} days ago`;
		}
		return 'a day ago';
	} else if (diff >= HOUR * 2) {
		if (diff >= HOUR * 2) {
			return `${Math.floor(diff / HOUR)} hours ago`;
		}
	}
	return 'recently';
}

export function todayStart() {
	return new Date().setHours(0, 0, 0, 0);
}

export function useCurrencyFormat(amount: number) {
	const player = usePlayerSettings();
	const formatted = useMemo(() => currencyFormatter.format(amount), [amount]);
	if (!player) {
		return '';
	}
	if (player.settings.hideMoney) {
		return '';
	}
	return formatted;
}

export function useDateFormat(date: Date) {
	return useMemo(() => dateFormat(date), [date]);
}
