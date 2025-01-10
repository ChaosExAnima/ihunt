'use client';

import { logInAs } from '@/lib/user';
import { Hunter } from '@prisma/client';

import { Button } from './ui/button';

interface LogInButtonProps {
	hunter: Hunter;
}

export default function LogInButton({ hunter }: LogInButtonProps) {
	return (
		<Button
			key={hunter.id}
			onClick={() => logInAs(hunter.id)}
			variant="secondary"
		>
			{hunter.name}
		</Button>
	);
}
