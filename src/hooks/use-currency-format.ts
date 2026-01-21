import { useMemo } from 'react';

import { currencyFormatter } from '@/lib/formats';

import { useSettings } from './use-settings';

export function useCurrencyFormat(amount: number) {
	const [settings] = useSettings();
	const formatted = useMemo(() => currencyFormatter.format(amount), [amount]);
	if (!settings) {
		return '';
	}
	if (settings.hideMoney) {
		return '';
	}
	return formatted;
}
