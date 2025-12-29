import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';

import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/api';
import { dateFormat, useCurrencyFormat } from '@/lib/formats';
import { HuntSchema } from '@/lib/schemas';

import Header from '../header';

export function HuntsCompleted() {
	const { data: hunts } = useQuery(trpc.hunt.getCompleted.queryOptions());

	// TODO: Update dates as time passes.
	const huntsByDate: [string, HuntSchema[]][] = useMemo(() => {
		if (!hunts) {
			return [];
		}
		const huntsByDate = new Map<string, HuntSchema[]>();
		for (const hunt of hunts) {
			const { completedAt, createdAt, scheduledAt } = hunt;
			const date = completedAt ?? scheduledAt ?? createdAt;
			const key = dateFormat(date);
			const huntsInDate = huntsByDate.get(key) ?? [];
			huntsInDate.push(hunt);
			huntsByDate.set(key, huntsInDate);
		}

		return [...huntsByDate];
	}, [hunts]);

	if (!hunts) {
		return null;
	}

	if (hunts.length === 0) {
		return (
			<div className="mx-4">
				<Header className="mb-2" level={3}>
					No completed hunts yet!
				</Header>
				<p>
					Come back here after finishing a hunt to see your hunter
					history.
				</p>
			</div>
		);
	}

	return (
		<ol className="mx-4 flex flex-col min-h-full">
			{huntsByDate.map(([date, hunts]) => (
				<li className="mb-4" key={date}>
					<p className="mb-4">{date}</p>
					<ul className="flex flex-col gap-4">
						{hunts.map((hunt) => (
							<HuntCompleted hunt={hunt} key={hunt.id} />
						))}
					</ul>
				</li>
			))}
			<p className="text-muted text-sm">
				For your safety, hunts older than 7 days are hidden. Please
				contact support if you have any questions.
			</p>
		</ol>
	);
}

function HuntCompleted({ hunt }: { hunt: HuntSchema }) {
	const payment = useCurrencyFormat(hunt.payment);
	return (
		<li>
			<Card
				asChild
				className="block border border-stone-400 dark:border-stone-800 p-4 shadow-lg"
			>
				<Link
					params={{ huntId: hunt.id.toString() }}
					to="/hunts/$huntId"
				>
					{hunt.name}
					{payment && `‒ ${payment}`}
					<ArrowRight className="float-right" />
				</Link>
			</Card>
		</li>
	);
}
