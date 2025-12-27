import { useMutation, useQuery } from '@tanstack/react-query';
import {
	ArrowDownUp,
	Database,
	DatabaseZap,
	FileImage,
	FileLock,
	FileLock2,
	FileType2,
	Home,
	Puzzle,
	Server,
} from 'lucide-react';
import { PropsWithChildren, useCallback } from 'react';

import { useInvalidate } from '@/hooks/use-invalidate';
import { trpc } from '@/lib/api';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
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
		<div className="hidden sm:block max-w-96 mx-auto">
			<ul className="flex flex-wrap justify-center gap-4 my-4">
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
					href="https://trpc.io/docs/server/introduction"
					name="TRPC"
				>
					<ArrowDownUp />
				</ExternalLink>
				<ExternalLink
					href="https://fastify.dev/docs/latest/Guides/"
					name="Fastify"
				>
					<Server />
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
				<ExternalLink
					href="https://lucide.dev/icons/"
					name="Lucide Icons"
				>
					<FileImage />
				</ExternalLink>
			</ul>
			<SwitchUser />
		</div>
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

function SwitchUser() {
	const { data: hunters, isLoading } = useQuery(
		trpc.hunter.getMany.queryOptions(),
	);

	const invalidate = useInvalidate();
	const { mutate } = useMutation(
		trpc.auth.switch.mutationOptions({
			onSuccess() {
				invalidate([
					trpc.auth.me.queryKey(),
					trpc.hunter.getMany.queryKey(),
				]);
			},
		}),
	);
	const handleChange = useCallback(
		(id: string) => {
			mutate({ hunterId: id });
		},
		[mutate],
	);

	if (isLoading || !hunters?.length) {
		return null;
	}

	return (
		<Select
			onValueChange={handleChange}
			value={hunters.find(({ me }) => me)?.id.toString()}
		>
			<SelectTrigger>
				<SelectValue placeholder="Current hunter" />
			</SelectTrigger>
			<SelectContent>
				{hunters.map((hunter) => (
					<SelectItem key={hunter.id} value={hunter.id.toString()}>
						{hunter.handle}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
