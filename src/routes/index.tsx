import { createFileRoute } from '@tanstack/react-router';

import Welcome from '@/components/welcome';
import { cn, isDev } from '@/lib/utils';

export const Route = createFileRoute('/')({
	component: Index,
});

const devMode = isDev();

function Index() {
	return (
		<Welcome
			className={cn(
				devMode && 'border border-stone-400 dark:border-stone-800',
				devMode && 'w-full sm:w-[360px] min-h-[687px] mx-auto mt-4',
			)}
			logInAction={Promise.resolve}
		/>
	);
}
