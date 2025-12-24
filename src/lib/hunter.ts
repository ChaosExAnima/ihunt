import { BookMarked, Handshake, Swords, Wrench } from 'lucide-react';

import { HunterTypes } from './constants';
import { HunterTypeSchema } from './schemas';

export function hunterTypeIcon(type: HunterTypeSchema | null) {
	switch (type) {
		case HunterTypes.Evileena:
			return BookMarked;
		case HunterTypes.Knight:
			return Swords;
		case HunterTypes.Phooey:
			return Wrench;
		case HunterTypes.SixtySixer:
			return Handshake;
		default:
			return null;
	}
}
