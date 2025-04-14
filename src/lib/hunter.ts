import { BookMarked, Handshake, Swords, Wrench } from 'lucide-react';

import { HunterTypes } from './constants';

export function hunterTypeIcon(type: null | string) {
	switch (type) {
		case HunterTypes.Evileena:
			return BookMarked;
		case HunterTypes.Knight:
			return Swords;
		case HunterTypes.Phooey:
			return Wrench;
		case HunterTypes.SixtySix:
			return Handshake;
		default:
			return null;
	}
}
