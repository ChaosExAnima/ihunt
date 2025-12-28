import type { JSX, PropsWithChildren } from 'react';

import { Link, LinkProps } from '@tanstack/react-router';
import { Crosshair, MessageCircle } from 'lucide-react';

import { HunterSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

import Avatar from './avatar';

export interface NavbarProps {
	hunter: HunterSchema;
	isHuntActive: boolean;
}

interface NavbarItemProps {
	className?: string;
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
		<nav className="border-b border-stone-400 dark:border-stone-800 bg-white dark:bg-background shadow-md mb-4 sticky">
			<ol className="flex gap-2 justify-start items-center">
				<NavbarItemLink
					className={cn(isHuntActive && 'text-rose-700')}
					icon={<Crosshair />}
					name="Hunts"
					to="/hunts"
				/>
				{/** See: https://gist.github.com/ghostrider-05/8f1a0bfc27c7c4509b4ea4e8ce718af0 */}
				<NavbarItemLink
					href="discord://-/"
					icon={<MessageCircle />}
					name="Messages"
				/>
				<NavbarItemLink
					className="ml-auto"
					icon={<Avatar hunter={hunter} />}
					name="Settings"
					noLabel
					to="/settings"
				/>
				{children ? <li>{children}</li> : null}
			</ol>
		</nav>
	);
}

function NavbarItemLink({
	className,
	icon,
	name,
	noLabel,
	...props
}: LinkProps & NavbarItemProps) {
	return (
		<li className={className}>
			<Link
				{...props}
				aria-label={name}
				className="p-4 w-full text-center flex gap-2"
			>
				{icon}
				{!noLabel && <span className="hidden sm:block">{name}</span>}
			</Link>
		</li>
	);
}
