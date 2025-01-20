import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import {
	defaultHandler,
	getListHandler,
	RaPayload,
} from 'ra-data-simple-prisma';

import { db } from '@/lib/db';

const route = async (req: Request) => {
	const body: RaPayload<'Hunt'> = await req.json();

	switch (body.method) {
		case 'getList': {
			const result = await getListHandler<Prisma.PhotoFindManyArgs>(
				body,
				db.photo,
				{
					include: {
						hunter: {
							include: {
								avatar: true,
							},
						},
					},
				},
			);
			return NextResponse.json(result);
		}
		default: {
			const result = await defaultHandler(body, db);
			return NextResponse.json(result);
		}
	}
};

export { route as GET, route as POST };
