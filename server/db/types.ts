import { InferSelectModel } from 'drizzle-orm';

import * as schemas from './schema';

export type Hunt = InferSelectModel<typeof schemas.hunts>;
export type HuntInvite = InferSelectModel<typeof schemas.huntInvites>;

export type Hunter = InferSelectModel<typeof schemas.hunters>;
export type HunterGroup = InferSelectModel<typeof schemas.hunterGroups>;

export type User = InferSelectModel<typeof schemas.users>;
export type UserVapid = InferSelectModel<typeof schemas.userVapids>;

export type Photo = InferSelectModel<typeof schemas.photos>;
