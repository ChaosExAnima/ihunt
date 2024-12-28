import { Database, DatabaseZap, FileCode, FileImage, Home } from 'lucide-react';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

interface LinkProps {
	href: string;
}

export default function DevTools() {
	return (
		<ul className="flex justify-center gap-4 my-4 w-full text-stone-700">
			<ExternalLink href="http://localhost:5555">
				<Database />
			</ExternalLink>
			<ExternalLink href="/">
				<Home />
			</ExternalLink>
			<ExternalLink href="https://nextjs.org/docs/app/building-your-application">
				<FileCode />
			</ExternalLink>
			<ExternalLink href="https://www.prisma.io/docs/orm/prisma-client">
				<DatabaseZap />
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
				className="text-stone-700 hover:text-stone-200 transition-colors"
				href={href}
				target={href.startsWith('/') ? '_self' : '_blank'}
			>
				{children}
			</Link>
		</li>
	);
}
