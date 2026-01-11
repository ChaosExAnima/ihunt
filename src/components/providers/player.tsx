import { inferOutput } from '@trpc/tanstack-react-query';
import { createContext, PropsWithChildren, useContext } from 'react';

import { trpc } from '@/lib/api';

export type PlayerInfo = inferOutput<typeof trpc.auth.me>;

const PlayerInfoContext = createContext<null | PlayerInfo>(null);

export function PlayerInfoProvider({
	children,
	info,
}: PropsWithChildren<{ info: PlayerInfo }>) {
	return (
		<PlayerInfoContext.Provider value={info ?? null}>
			{children}
		</PlayerInfoContext.Provider>
	);
}

export function usePlayer() {
	return useContext(PlayerInfoContext);
}
