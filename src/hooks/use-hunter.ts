import { usePlayerSettings } from '@/components/providers/player';

export function useHunter() {
	const settings = usePlayerSettings();
	return settings?.hunter ?? null;
}

export function useHunterId() {
	const hunter = useHunter();
	return hunter?.id ?? null;
}
