'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ComponentProps, useMemo } from 'react';

export function Providers({
	children,
	...props
}: ComponentProps<typeof NextThemesProvider>) {
	const client = useMemo(() => new QueryClient(), []);
	return (
		<NextThemesProvider {...props}>
			<QueryClientProvider client={client}>
				{children}
				<ReactQueryDevtools />
			</QueryClientProvider>
		</NextThemesProvider>
	);
}
