import { isAdmin } from '@/lib/user';
import { redirect } from 'next/navigation';

export async function GET() {
	const admin = await isAdmin();
	if (admin) {
		throw redirect('/admin/hunts');
	}
	throw redirect('/admin/login');
}
