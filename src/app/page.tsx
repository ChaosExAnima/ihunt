import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
	return (
		<>
			<h1 className="text-4xl font-bold m-4">Log in</h1>
			<Button variant="secondary" asChild className="mx-4">
				<Link href="/hunts">Click here to log in</Link>
			</Button>
		</>
	);
}
