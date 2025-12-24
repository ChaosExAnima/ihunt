import {
	BookMarked,
	Handshake,
	LucideProps,
	Swords,
	Wrench,
} from 'lucide-react';

import { HunterTypes } from '@/lib/constants';
import { HunterTypeSchema } from '@/lib/schemas';

export function HunterTypeIcon({
	type,
	...props
}: Omit<LucideProps, 'type'> & { type: HunterTypeSchema | null }) {
	switch (type) {
		case HunterTypes.Evileena:
			return <BookMarked {...props} />;
		case HunterTypes.Knight:
			return <Swords {...props} />;
		case HunterTypes.Phooey:
			return <Wrench {...props} />;
		case HunterTypes.SixtySixer:
			return <Handshake {...props} />;
		default:
			return null;
	}
}
