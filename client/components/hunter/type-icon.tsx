import { HunterTypes } from '@ihunt/lib/constants';
import { HunterTypeSchema } from '@ihunt/lib/schemas';
import {
	BookMarked,
	Handshake,
	LucideProps,
	Swords,
	Wrench,
} from 'lucide-react';

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
