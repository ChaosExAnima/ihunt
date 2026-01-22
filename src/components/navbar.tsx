import type { JSX, PropsWithChildren } from 'react';

import { Link, LinkProps } from '@tanstack/react-router';
import { Crosshair } from 'lucide-react';

import { HunterSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

import { Avatar } from './avatar';

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

export function Navbar({
	children,
	hunter,
	isHuntActive,
}: PropsWithChildren<NavbarProps>) {
	return (
		<nav className="border-b border-border bg-white dark:bg-background shadow-md mb-4 sticky">
			<ol className="flex gap-2 justify-start items-center">
				<NavbarItemLink
					className={cn(isHuntActive && 'text-rose-700')}
					icon={<Crosshair />}
					name="Hunts"
					to="/hunts"
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
				{!noLabel && name}
			</Link>
		</li>
	);
}
