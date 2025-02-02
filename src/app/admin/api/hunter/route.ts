import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import {
	defaultHandler,
	getListHandler,
	getOneHandler,
	RaPayload,
} from 'ra-data-simple-prisma';

import { db } from '@/lib/db';

const route = async (req: Request) => {
	const body: RaPayload<Prisma.ModelName> = await req.json();

	switch (body.method) {
		case 'getList': {
			const result = await getListHandler<Prisma.HunterFindManyArgs>(
				body,
				db.hunter,
				{
					include: {
						avatar: true,
						hunts: true,
						user: true,
					},
				},
			);
			return NextResponse.json(result);
		}
		case 'getOne': {
			const result = await getOneHandler<Prisma.HunterFindUniqueArgs>(
				body,
				db.hunter,
				{
					include: {
						avatar: true,
						photos: true,
						user: true,
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
