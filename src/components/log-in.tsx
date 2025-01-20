'use client';

import { Hunter } from '@prisma/client';
import { useRouter } from 'next/navigation';

import { logInAs } from '@/lib/user';

import { Button } from './ui/button';

interface LogInButtonProps {
	hunter: Hunter;
}

export default function LogInButton({ hunter }: LogInButtonProps) {
	const router = useRouter();
	return (
		<Button
			key={hunter.id}
			onClick={async () => {
				await logInAs(hunter.id);
				router.push('/hunts');
			}}
			variant="secondary"
		>
			{hunter.name}
		</Button>
	);
}
