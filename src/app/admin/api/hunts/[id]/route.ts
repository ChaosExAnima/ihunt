import { HuntStatus } from '@/lib/constants';
import { db } from '@/lib/db';
import { z } from 'zod';

const bodySchema = z.object({
	status: z.nativeEnum(HuntStatus),
});

interface RouteParams {
	id: string;
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<RouteParams> },
) {
	const body = await request.json();
	const { status } = bodySchema.parse(body);
	const { id } = await params;

	await db.hunt.update({
		data: {
			status,
		},
		where: { id: Number.parseInt(id) },
	});
}
