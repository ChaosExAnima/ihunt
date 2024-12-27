import Link from 'next/link';
import type { JSX, PropsWithChildren } from 'react';
import { Crosshair, MessageCircle, Settings } from 'lucide-react';

export default function Navbar({ children }: PropsWithChildren) {
	return (
		<nav className="border-b border-stone-400 dark:border-stone-800 shadow-md mb-4 sticky">
			<ol className="flex gap-2 justify-between">
				<NavbarItemLink
					href="/hunts"
					name="Hunts"
					icon={<Crosshair />}
				/>
				{/** See: https://gist.github.com/ghostrider-05/8f1a0bfc27c7c4509b4ea4e8ce718af0 */}
				<NavbarItemLink
					href="discord://-/"
					name="Messages"
					icon={<MessageCircle />}
				/>
				<NavbarItemLink
					href="/settings"
					name="Settings"
					icon={<Settings />}
					noLabel
				/>
				{children ? <li>{children}</li> : null}
			</ol>
		</nav>
	);
}

interface NavbarItemProps {
	href: string;
	name: string;
	icon: JSX.Element;
	noLabel?: boolean;
}

function NavbarItemLink({ href, name, icon, noLabel }: NavbarItemProps) {
	return (
		<li className="">
			<Link
				href={href}
				className="p-4 w-full text-center flex gap-2"
				aria-label={name}
			>
				{icon}
				{!noLabel && <span className="hidden sm:block">{name}</span>}
			</Link>
		</li>
	);
}
