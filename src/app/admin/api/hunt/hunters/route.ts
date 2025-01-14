import { db } from '@/lib/db';
import { z } from 'zod';

const huntersSchema = z.object({
	hunterId: z.coerce.number().min(1),
	huntId: z.coerce.number().min(1),
});

// Custom method as the provider doesn't handle disconnects
export async function DELETE(req: Request) {
	const body = await req.json();
	const { hunterId, huntId } = huntersSchema.parse(body);

	await db.hunt.update({
		data: {
			hunters: {
				disconnect: {
					id: hunterId,
				},
			},
		},
		where: {
			id: huntId,
		},
	});
}
