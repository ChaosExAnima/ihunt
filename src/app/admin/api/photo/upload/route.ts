import { idSchemaCoerce } from '@/lib/api';
import { db } from '@/lib/db';
import { uploadPhoto } from '@/lib/photo';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(request: NextRequest) {
	const params = request.nextUrl.searchParams;
	const hunterId = idSchemaCoerce.nullable().parse(params.get('hunterId'));
	const huntId = idSchemaCoerce.nullable().parse(params.get('huntId'));
	const isAvatar = z.coerce.boolean().parse(params.get('avatar'));

	if (!hunterId && isAvatar) {
		return NextResponse.json({
			success: false,
		});
	}

	try {
		const body = await request.bytes();

		const photo = await uploadPhoto({
			buffer: body,
			hunterId,
			huntId,
		});

		if (hunterId && isAvatar) {
			await db.hunter.update({
				data: {
					avatarId: photo.id,
				},
				where: { id: hunterId },
			});
		}
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
