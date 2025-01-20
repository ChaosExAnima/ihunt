import { NextApiRequest, NextApiResponse } from 'next';
import { defaultHandler } from 'ra-data-simple-prisma';

import { db } from '@/lib/db';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const result = await defaultHandler(req.body, db);
	res.json(result);
}
