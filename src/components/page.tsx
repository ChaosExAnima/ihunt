import { PropsWithChildren } from 'react';

export default function Page({ children }: PropsWithChildren) {
	return (
		<main className="bg-background text-foreground border-secondary border min-h-full">
			{children}
		</main>
	);
}
