import type { JSX, PropsWithChildren } from 'react';

import { Crosshair, MessageCircle } from 'lucide-react';
import Link from 'next/link';

import { HunterSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

import Avatar from './avatar';

export interface NavbarProps {
	hunter: HunterSchema;
	isHuntActive: boolean;
}

interface NavbarItemProps {
	className?: string;
	href: string;
	icon: JSX.Element;
	name: string;
	noLabel?: boolean;
}

export default function Navbar({
	children,
	hunter,
	isHuntActive,
}: PropsWithChildren<NavbarProps>) {
	return (
		<nav className="border-b border-stone-400 dark:border-stone-800 bg-background shadow-md mb-4 sticky">
			<ol className="flex gap-2 justify-start items-center">
				<NavbarItemLink
					className={cn(isHuntActive && 'text-rose-700')}
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
					className="ml-auto"
					href="/settings"
					icon={<Avatar hunter={hunter} />}
					name="Settings"
					noLabel
				/>
				{children ? <li>{children}</li> : null}
			</ol>
		</nav>
	);
}

function NavbarItemLink({
	className,
	href,
	icon,
	name,
	noLabel,
}: NavbarItemProps) {
	return (
		<li className={className}>
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
