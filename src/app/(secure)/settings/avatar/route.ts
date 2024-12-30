import { uploadPhoto } from '@/lib/photo';
import { fetchCurrentUser } from '@/lib/user';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const body = await request.bytes();
		const user = await fetchCurrentUser();
		await uploadPhoto({ buffer: body, hunterId: user.id });
	} catch (err: unknown) {
		console.error('Error with upload:', err);
		return NextResponse.json({
			success: false,
		});
	}

	return NextResponse.json({
		success: true,
	});
}
