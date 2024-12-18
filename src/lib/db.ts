import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function test() {
	const hunt = await prisma.hunt.findFirstOrThrow({
		include: {
			hunters: {
				include: {
					hunter: true,
				},
			},
		},
	});
	const hunters = hunt.hunters.map((hunter) => hunter.hunter);
	return hunters;
}
