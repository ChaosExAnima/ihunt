import { HuntStatus, HuntStatusValues } from '@/lib/constants';

import { AdminHuntSchema } from '../schemas';

type HuntStatusName = keyof typeof HuntStatus;
export const statusNames = Object.keys(HuntStatus) as HuntStatusName[];

export function huntStatusChoices(disabled: HuntStatusValues[] = []) {
	return statusNames.map((status) => ({
		disabled: disabled.includes(HuntStatus[status]),
		id: HuntStatus[status],
		name: status,
	}));
}

export function renderHuntStatus(record: AdminHuntSchema) {
	return statusNames.find((name) => HuntStatus[name] === record.status);
}
