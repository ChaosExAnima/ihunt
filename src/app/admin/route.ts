import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET() {
	const cookieStore = await cookies();
	if (cookieStore.get('admin')?.value === 'yes') {
		throw redirect('/admin/hunts');
	}
	throw redirect('/admin/login');
}
