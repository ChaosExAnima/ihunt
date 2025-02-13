import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import {
	defaultHandler,
	getListHandler,
	getOneHandler,
	RaPayload,
	updateHandler,
} from 'ra-data-simple-prisma';

import { db } from '@/lib/db';

const route = async (req: Request) => {
	try {
		const body: RaPayload<'Hunter'> = await req.json();

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
			case 'update': {
				const result = await updateHandler<Prisma.HunterUpdateArgs>(
					body,
					db.hunter,
				);
				return NextResponse.json(result);
			}
			default: {
				const result = await defaultHandler(body, db);
				return NextResponse.json(result);
			}
		}
	} catch (err) {
		if (err instanceof Error) {
			console.error(err.stack);
			return NextResponse.json({
				error: true,
				message: err.message,
			});
		}
	}
};

export { route as GET, route as POST };
