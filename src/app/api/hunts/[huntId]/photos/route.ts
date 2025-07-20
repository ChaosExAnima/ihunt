import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { idSchemaCoerce } from '@/lib/schemas';
import { uploadPhoto } from '@/server/photo';
import { sessionToHunter } from '@/server/user';

type HuntPhotosRouteParams = {
	params: Promise<{
		huntId: string;
	}>;
};

export async function DELETE(
	request: NextRequest,
	{ params }: HuntPhotosRouteParams,
) {
	try {
		const { huntId } = await params;
		const photoId = idSchemaCoerce.parse(
			request.nextUrl.searchParams.get('photoId'),
		);
		if (!photoId) {
			throw new Error('No photoId');
		}
		const hunter = await sessionToHunter();

		await db.photo.update({
			data: {
				huntId: null,
			},
			where: {
				hunterId: hunter.id,
				huntId: idSchemaCoerce.parse(huntId),
				id: photoId,
			},
		});
	} catch (err: unknown) {
		if (err instanceof Error) {
			console.error('Error with deletion:', err.stack);
		}
		return NextResponse.json({
			success: false,
		});
	}

	return NextResponse.json({
		success: true,
	});
}

export async function POST(
	request: NextRequest,
	{ params }: HuntPhotosRouteParams,
) {
	try {
		const { huntId } = await params;
		const body = await request.bytes();
		const user = await sessionToHunter();

		await uploadPhoto({
			buffer: body,
			hunterId: user.id,
			huntId: Number.parseInt(huntId, 10),
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
