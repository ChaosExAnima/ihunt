import { huntDisplayInclude } from '@/components/hunt/consts';
import EditHunt, { EditHuntAction } from '@/components/hunt/edit';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import Modal from './modal';

export interface AdminHuntParams {
	params: Promise<{
		id: string;
	}>;
}

export default async function EditHuntModal({ params }: AdminHuntParams) {
	const { id } = await params;
	const hunt = await db.hunt.findFirstOrThrow({
		include: huntDisplayInclude,
		where: { id: Number.parseInt(id) },
	});
	return (
		<Modal>
			<EditHunt hunt={hunt} saveAction={updateHunt} />
		</Modal>
	);
}

export const updateHunt: EditHuntAction = async (newHunt, { id }) => {
	'use server';
	await db.hunt.update({
		data: newHunt,
		where: {
			id,
		},
	});
	console.log(`Updated hunt ${id}:`, newHunt);
	revalidatePath('/admin/hunts');
	redirect('/admin/hunts');
};
