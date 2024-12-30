import {
	Database,
	DatabaseZap,
	FileCode,
	FileImage,
	FileLock2,
	FileType2,
	Home,
	Puzzle,
} from 'lucide-react';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

interface LinkProps {
	href: string;
}

export default function DevTools() {
	return (
		<ul className="flex justify-center gap-4 my-4">
			<ExternalLink href="http://localhost:5555">
				<Database />
			</ExternalLink>
			<ExternalLink href="/">
				<Home />
			</ExternalLink>
			<ExternalLink href="/admin">
				<FileLock2 />
			</ExternalLink>
			<ExternalLink href="https://nextjs.org/docs/app/building-your-application">
				<FileCode />
			</ExternalLink>
			<ExternalLink href="https://www.prisma.io/docs/orm/prisma-client">
				<DatabaseZap />
			</ExternalLink>
			<ExternalLink href="https://tailwindcss.com/docs/utility-first">
				<FileType2 />
			</ExternalLink>
			<ExternalLink href="https://ui.shadcn.com/docs/components/accordion">
				<Puzzle />
			</ExternalLink>
			<ExternalLink href="https://lucide.dev/icons/">
				<FileImage />
			</ExternalLink>
		</ul>
	);
}

function ExternalLink({ children, href }: PropsWithChildren<LinkProps>) {
	return (
		<li>
			<Link
				className="text-stone-400 hover:text-stone-500 dark:text-stone-700 dark:hover:text-stone-400 transition-colors"
				href={href}
				target={href.startsWith('/') ? '_self' : '_blank'}
			>
				{children}
			</Link>
		</li>
	);
}
