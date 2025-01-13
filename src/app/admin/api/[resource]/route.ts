import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { defaultHandler } from 'ra-data-simple-prisma';

const handler = async (req: Request) => {
	const body = await req.json();
	const result = await defaultHandler(body, db);
	return NextResponse.json(result);
};

export { handler as GET, handler as POST };
