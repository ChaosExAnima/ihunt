import { HuntStatus } from '@/lib/constants';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
	try {
		await Promise.all([
			db.hunter.deleteMany(),
			db.hunt.deleteMany(),
			db.huntHunter.deleteMany(),
		]);
		await db.hunter.createMany({
			data: [
				{
					id: 1,
					name: 'Moody Hunter',
					rating: 1,
					userId: 1,
				},
				{
					id: 2,
					name: 'Chipper Hunter',
					rating: 3,
					userId: 2,
				},
			],
		});
		await db.hunt.createMany({
			data: [
				{
					id: 1,
					description: 'Werewolf',
					status: HuntStatus.Available,
					maxHunters: 2,
					minRating: 1,
				},
				{
					id: 2,
					description: 'Vampire',
					status: HuntStatus.Available,
					maxHunters: 1,
					minRating: 3,
				},
			],
		});
	} catch (err) {
		console.log('Error seeding database:', err);
	} finally {
		await db.$disconnect();
	}
}

main();
