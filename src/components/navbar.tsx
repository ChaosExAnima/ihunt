import type { JSX, PropsWithChildren } from 'react';

import { Crosshair, MessageCircle, Settings } from 'lucide-react';
import Link from 'next/link';

interface NavbarItemProps {
	href: string;
	icon: JSX.Element;
	name: string;
	noLabel?: boolean;
}

export default function Navbar({ children }: PropsWithChildren) {
	return (
		<nav className="border-b border-stone-400 dark:border-stone-800 shadow-md mb-4 sticky">
			<ol className="flex gap-2 justify-between">
				<NavbarItemLink
					href="/hunts"
					icon={<Crosshair />}
					name="Hunts"
				/>
				{/** See: https://gist.github.com/ghostrider-05/8f1a0bfc27c7c4509b4ea4e8ce718af0 */}
				<NavbarItemLink
					href="discord://-/"
					icon={<MessageCircle />}
					name="Messages"
				/>
				<NavbarItemLink
					href="/settings"
					icon={<Settings />}
					name="Settings"
					noLabel
				/>
				{children ? <li>{children}</li> : null}
			</ol>
		</nav>
	);
}

function NavbarItemLink({ href, icon, name, noLabel }: NavbarItemProps) {
	return (
		<li className="">
			<Link
				aria-label={name}
				className="p-4 w-full text-center flex gap-2"
				href={href}
			>
				{icon}
				{!noLabel && <span className="hidden sm:block">{name}</span>}
			</Link>
		</li>
	);
}
