import { db } from '@/lib/db';
import { uploadPhoto } from '@/lib/photo';
import { fetchCurrentUser } from '@/lib/user';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const body = await request.bytes();
		const user = await fetchCurrentUser();

		const photo = await uploadPhoto({
			buffer: body,
			hunterId: user.id,
			name: `avatar-${user.id}.jpg`,
		});
		await db.hunter.update({
			data: {
				avatarId: photo.id,
			},
			where: { id: user.id },
		});

		revalidatePath('/settings');
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
