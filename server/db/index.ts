import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

import * as relations from './relations';
import * as schema from './schema';

export const client = new Client(process.env.DATABASE_URL);

export const db = drizzle({ client, schema: { ...schema, ...relations } });
