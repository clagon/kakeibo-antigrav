import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

// SvelteKitの環境変数からDB接続文字列を取得
const db = drizzle(env.DATABASE_URL!, { schema });

export default db;
