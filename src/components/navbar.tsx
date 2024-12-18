import Link from 'next/link';
import { PropsWithChildren } from 'react';

export default function Navbar({ children }: PropsWithChildren) {
	return (
		<nav className="border-b">
			<ol className="flex gap-2 justify-between">
				<li>
					<Link href="/hunts">Hunts</Link>
				</li>
				<li>
					<Link href="/settings">Settings</Link>
				</li>
				<li>
					<a href="discord://-/">Messages</a>
				</li>
				{children ? <li>{children}</li> : null}
			</ol>
		</nav>
	);
}
