import {
	Database,
	DatabaseZap,
	FileImage,
	FileLock,
	FileLock2,
	FileType2,
	Home,
	Puzzle,
} from 'lucide-react';
import { PropsWithChildren } from 'react';

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from './ui/tooltip';

interface LinkProps {
	href: string;
	name?: string;
}

export default function DevTools() {
	return (
		<ul className="flex justify-center gap-4 my-4">
			<ExternalLink href="/">
				<Home />
			</ExternalLink>
			<ExternalLink href="http://localhost:5555" name="Prisma Studio">
				<Database />
			</ExternalLink>
			<ExternalLink href="/admin" name="Admin">
				<FileLock2 />
			</ExternalLink>
			<ExternalLink
				href="https://www.prisma.io/docs/orm/prisma-client"
				name="Prisma"
			>
				<DatabaseZap />
			</ExternalLink>
			<ExternalLink
				href="https://tailwindcss.com/docs/utility-first"
				name="TailwindCSS"
			>
				<FileType2 />
			</ExternalLink>
			<ExternalLink
				href="https://ui.shadcn.com/docs/components/accordion"
				name="ShadCN"
			>
				<Puzzle />
			</ExternalLink>
			<ExternalLink
				href="https://marmelab.com/react-admin/Admin.html"
				name="React Admin"
			>
				<FileLock />
			</ExternalLink>
			<ExternalLink href="https://lucide.dev/icons/" name="Lucide Icons">
				<FileImage />
			</ExternalLink>
		</ul>
	);
}

function ExternalLink({ children, href, name }: PropsWithChildren<LinkProps>) {
	if (name) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>
						<ExternalLink href={href}>{children}</ExternalLink>
					</TooltipTrigger>
					<TooltipContent>{name}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}
	return (
		<li>
			<a
				className="text-stone-400 hover:text-stone-500 dark:text-stone-700 dark:hover:text-stone-400 transition-colors"
				href={href}
				rel="noreferrer"
				target={href.startsWith('/') ? '_self' : '_blank'}
			>
				{children}
			</a>
		</li>
	);
}
