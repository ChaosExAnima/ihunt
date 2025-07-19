import { z } from 'zod';

import { HuntStatus, HuntStatusValues } from '@/lib/constants';
import { HuntSchema, huntSchema } from '@/lib/schemas';

type HuntStatusName = keyof typeof HuntStatus;
export const statusNames = Object.keys(HuntStatus) as HuntStatusName[];

export const huntSchemaWithIds = z.object({
	...huntSchema.omit({ photos: true }),
	hunters: z.array(z.number()),
});

export function renderHuntStatus(record: HuntSchema) {
	return statusNames.find((name) => HuntStatus[name] === record.status);
}

export function huntStatusChoices(disabled: HuntStatusValues[] = []) {
	return statusNames.map((status) => ({
		disabled: disabled.includes(HuntStatus[status]),
		id: HuntStatus[status],
		name: status,
	}));
}

export function huntTransformer(data: Partial<HuntSchema>) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { hunters, photos, ...rest } = data;
	return rest;
}
