import { useQuery } from '@tanstack/react-query';
import { inferOutput } from '@trpc/tanstack-react-query';
import { createContext, PropsWithChildren, useContext } from 'react';

import { trpc } from '@/lib/api';

export type PlayerSettings = inferOutput<typeof trpc.auth.me>;

const PlayerSettingsContext = createContext<null | PlayerSettings>(null);

export function PlayerSettingsProvider({ children }: PropsWithChildren) {
	const { data: settings } = useQuery(trpc.auth.me.queryOptions());
	return (
		<PlayerSettingsContext.Provider value={settings ?? null}>
			{children}
		</PlayerSettingsContext.Provider>
	);
}

export function usePlayerSettings() {
	return useContext(PlayerSettingsContext);
}
