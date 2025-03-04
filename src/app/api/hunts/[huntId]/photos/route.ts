import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { uploadPhoto } from '@/lib/photo';
import { sessionToHunter } from '@/lib/user';

type HuntPhotosRouteParams = {
	params: Promise<{
		huntId: string;
	}>;
};

export async function POST(
	request: NextRequest,
	{ params }: HuntPhotosRouteParams,
) {
	try {
		const { huntId } = await params;
		const body = await request.bytes();
		const user = await sessionToHunter();

		const photo = await uploadPhoto({
			buffer: body,
			hunterId: user.id,
			huntId: Number.parseInt(huntId, 10),
		});
		await db.hunter.update({
			data: {
				avatarId: photo.id,
			},
			where: { id: user.id },
		});
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error('Error with upload:', err.stack);
		}
		return NextResponse.json({
			success: false,
		});
	}

	return NextResponse.json({
		success: true,
	});
}
