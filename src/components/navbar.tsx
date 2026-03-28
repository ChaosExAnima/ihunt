import type { JSX, PropsWithChildren, ReactNode } from 'react';

import { Link, LinkProps } from '@tanstack/react-router';
import { BellIcon, Crosshair, SettingsIcon } from 'lucide-react';

import { useHunterId } from '@/hooks/use-hunter';
import { HunterSchema } from '@/lib/schemas';
import { cn } from '@/lib/styles';

import { Avatar } from './avatar';

export interface NavbarProps {
	hunter: HunterSchema;
	isHuntActive: boolean;
	unreadCount: number;
}

interface NavbarItemProps {
	className?: string;
	icon: JSX.Element;
	name: string;
	noLabel?: boolean;
	children?: ReactNode;
}

export function Navbar({
	children,
	hunter,
	isHuntActive,
	unreadCount,
}: PropsWithChildren<NavbarProps>) {
	const hunterId = useHunterId();
	return (
		<nav className="border-border dark:bg-background sticky mb-4 border-b bg-white  shadow-md">
			<ol className="flex items-center justify-start gap-2">
				<NavbarItemLink
					className={cn(isHuntActive && 'text-rose-700')}
					icon={<Crosshair />}
					name="Hunts"
					to="/hunts"
				/>
				<NavbarItemLink
					noLabel
					className="relative ml-auto"
					icon={<BellIcon />}
					name="Notifications"
					to="/notifications"
				>
					{unreadCount > 0 && (
						<span className="bg-accent text-accent-foreground absolute top-1 left-1 size-4 rounded-full text-xs font-bold">
							{unreadCount}
						</span>
					)}
				</NavbarItemLink>
				<NavbarItemLink
					noLabel
					icon={<SettingsIcon />}
					name="Settings"
					to="/settings"
				/>
				{hunterId && (
					<NavbarItemLink
						noLabel
						icon={<Avatar hunter={hunter} />}
						name="My Profile"
						to="/hunters/$hunterId"
						params={{ hunterId: hunterId.toString() }}
					/>
				)}
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
	children,
	...props
}: LinkProps & NavbarItemProps) {
	return (
		<li className={className}>
			<Link
				{...props}
				activeProps={{
					className: 'text-primary',
				}}
				aria-label={name}
				className="text-muted-foreground flex w-full gap-2 p-4 text-center"
			>
				{icon}
				{!noLabel && name}
				{children}
			</Link>
		</li>
	);
}
