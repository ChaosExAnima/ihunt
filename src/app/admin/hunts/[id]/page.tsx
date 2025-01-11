import Header from '@/components/header';
import { huntDisplayInclude } from '@/components/hunt/consts';
import EditHunt, { EditHuntAction } from '@/components/hunt/edit';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface AdminHuntParams {
	params: Promise<{
		id: string;
	}>;
}

export default async function AdminHunt({ params }: AdminHuntParams) {
	const { id } = await params;
	const hunt = await db.hunt.findFirstOrThrow({
		include: huntDisplayInclude,
		where: { id: Number.parseInt(id) },
	});

	return (
		<>
			<Header>Hunt Details</Header>
			<EditHunt
				backHref="/admin/hunts"
				hunt={hunt}
				saveAction={updateHunt}
			/>
		</>
	);
}

const updateHunt: EditHuntAction = async (newHunt, { id }) => {
	'use server';
	await db.hunt.update({
		data: newHunt,
		where: {
			id,
		},
	});
	console.log(`Updated hunt ${id}:`, newHunt);
	revalidatePath(`/admin/hunts/${id}`);
	redirect('/admin/hunts');
};
