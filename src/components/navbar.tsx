import Link from 'next/link';
import type { PropsWithChildren } from 'react';

export default function Navbar({ children }: PropsWithChildren) {
	return (
		<nav className="border-b border-stone-400 dark:border-stone-800 shadow-md mb-4 sticky">
			<ol className="flex gap-2 justify-stretch">
				<NavbarItemLink href="/hunts" name="Hunts" />
				<NavbarItemLink href="/settings" name="Settings" />
				{/** See: https://gist.github.com/ghostrider-05/8f1a0bfc27c7c4509b4ea4e8ce718af0 */}
				<NavbarItemLink href="discord://-/" name="Messages" />
				{children ? <li>{children}</li> : null}
			</ol>
		</nav>
	);
}

interface NavbarItemProps {
	href: string;
	name: string;
}

function NavbarItemLink({ href, name }: NavbarItemProps) {
	return (
		<li className="w-full">
			<Link href={href} className="block p-4 w-full text-center">
				{name}
			</Link>
		</li>
	);
}
