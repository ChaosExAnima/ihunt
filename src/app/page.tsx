import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
	return (
		<>
			<h1 className="text-4xl font-bold">Log in</h1>
			<Link href="/hunts">
				<Button variant="outline">Click here to log in</Button>
			</Link>
		</>
	);
}
