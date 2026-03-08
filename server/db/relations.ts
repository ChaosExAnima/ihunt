import { relations } from 'drizzle-orm/relations';

import {
	hunters,
	users,
	huntInvites,
	hunts,
	userVapids,
	photos,
	hunterGroups,
	huntToHunter,
} from './schema';

export const userRelations = relations(users, ({ one, many }) => ({
	hunter: one(hunters, {
		fields: [users.hunterId],
		references: [hunters.id],
	}),
	userVapids: many(userVapids),
}));

export const hunterRelations = relations(hunters, ({ one, many }) => ({
	users: many(users),
	huntInvites_fromHunterId: many(huntInvites, {
		relationName: 'huntInvite_fromHunterId_hunter_id',
	}),
	huntInvites_toHunterId: many(huntInvites, {
		relationName: 'huntInvite_toHunterId_hunter_id',
	}),
	photos: many(photos, {
		relationName: 'photo_hunterId_hunter_id',
	}),
	avatar: one(photos, {
		fields: [hunters.avatarId],
		references: [photos.id],
		relationName: 'hunter_avatarId_photo_id',
	}),
	hunterGroup: one(hunterGroups, {
		fields: [hunters.groupId],
		references: [hunterGroups.id],
	}),
	huntToHunters: many(huntToHunter),
}));

export const huntInviteRelations = relations(huntInvites, ({ one }) => ({
	hunter_fromHunterId: one(hunters, {
		fields: [huntInvites.fromHunterId],
		references: [hunters.id],
		relationName: 'huntInvite_fromHunterId_hunter_id',
	}),
	hunter_toHunterId: one(hunters, {
		fields: [huntInvites.toHunterId],
		references: [hunters.id],
		relationName: 'huntInvite_toHunterId_hunter_id',
	}),
	hunt: one(hunts, {
		fields: [huntInvites.huntId],
		references: [hunts.id],
	}),
}));

export const huntRelations = relations(hunts, ({ many }) => ({
	huntInvites: many(huntInvites),
	photos: many(photos),
	huntToHunters: many(huntToHunter),
}));

export const userVapidRelations = relations(userVapids, ({ one }) => ({
	user: one(users, {
		fields: [userVapids.userId],
		references: [users.id],
	}),
}));

export const photoRelations = relations(photos, ({ one, many }) => ({
	hunter: one(hunters, {
		fields: [photos.hunterId],
		references: [hunters.id],
		relationName: 'photo_hunterId_hunter_id',
	}),
	hunt: one(hunts, {
		fields: [photos.huntId],
		references: [hunts.id],
	}),
	hunters: many(hunters, {
		relationName: 'hunter_avatarId_photo_id',
	}),
}));

export const hunterGroupRelations = relations(hunterGroups, ({ many }) => ({
	hunters: many(hunters),
}));

export const huntToHunterRelations = relations(huntToHunter, ({ one }) => ({
	hunt: one(hunts, {
		fields: [huntToHunter.a],
		references: [hunts.id],
	}),
	hunter: one(hunters, {
		fields: [huntToHunter.b],
		references: [hunters.id],
	}),
}));
