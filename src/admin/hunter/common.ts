import { HunterTypes } from '@/lib/constants';

export const hunterTypeChoices = Object.entries(HunterTypes).map(
	([key, val]) => ({
		id: val,
		name: key,
	}),
);
