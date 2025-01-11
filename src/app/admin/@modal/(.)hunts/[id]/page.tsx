import { huntDisplayInclude } from '@/components/hunt/consts';
import EditHunt from '@/components/hunt/edit';
import { db } from '@/lib/db';

import { AdminHuntParams, updateHunt } from '../../../hunts/[id]/page';
import Modal from './modal';

export default async function EditHuntModal({ params }: AdminHuntParams) {
	const { id } = await params;
	const hunt = await db.hunt.findFirstOrThrow({
		include: huntDisplayInclude,
		where: { id: Number.parseInt(id) },
	});
	return (
		<Modal>
			<EditHunt
				backHref="/admin/hunts"
				hunt={hunt}
				saveAction={updateHunt}
			/>
		</Modal>
	);
}
