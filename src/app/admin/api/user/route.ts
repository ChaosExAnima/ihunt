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

const handler = async (req: Request) => {
	const body: RaPayload<'User'> = await req.json();
	try {
		switch (body.method) {
			case 'getList': {
				const list = await getListHandler<Prisma.UserFindManyArgs>(
					body,
					db.user,
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
				return NextResponse.json(list);
			}
			case 'getOne': {
				const result = await getOneHandler<Prisma.UserFindFirstArgs>(
					body,
					db.user,
					{
						include: {
							hunter: true,
						},
					},
				);
				return NextResponse.json(result);
			}
			case 'update': {
				const result = await updateHandler<Prisma.UserUpdateArgs>(
					body,
					db.user,
					{
						allowJsonUpdate: {
							hunter: true,
						},
						include: {
							hunter: true,
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
	} catch (err) {
		if (err instanceof Error) {
			console.log(err);
		} else {
			console.error(err);
		}
		return NextResponse.json({ success: false });
	}
};

export { handler as GET, handler as POST };
