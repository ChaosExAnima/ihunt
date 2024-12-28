import Header from '@/components/header';
import { db } from '@/lib/db';

export default async function AdminHuntsPage() {
	const hunts = await db.hunt.findMany({
		include: {
			_count: {
				select: {
					hunters: true,
				},
			},
			hunters: true,
		},
		orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
	});
	return (
		<>
			<Header>Hunts</Header>
			<table>
				<thead className="text-left">
					<tr>
						<th>Name</th>
						<th>Status</th>
						<th>Current Hunters</th>
						<th>Max Hunters</th>
					</tr>
				</thead>
				<tbody>
					{hunts.map((hunt) => (
						<tr key={hunt.id}>
							<td>{hunt.description}</td>
							<td>{hunt.status}</td>
							<td>{hunt._count.hunters}</td>
							<td>{hunt.maxHunters}</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	);
}
