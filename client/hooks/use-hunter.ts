import { useRouteContext } from '@tanstack/react-router';

export function useHunter() {
	const { hunter } = useRouteContext({ from: '/_auth' });
	return hunter;
}

export function useHunterId() {
	const hunter = useHunter();
	return hunter.id;
}
