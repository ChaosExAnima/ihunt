import { db } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';
import { defaultHandler } from 'ra-data-simple-prisma';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const result = await defaultHandler(req.body, db);
	res.json(result);
}
