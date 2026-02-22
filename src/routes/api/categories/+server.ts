import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';

/** カテゴリー一覧取得 API */
export const GET: RequestHandler = async ({ url }) => {
	const type = url.searchParams.get('type');

	// タイプフィルタ
	const query = type
		? db
				.select()
				.from(categories)
				.where(eq(categories.type, type as 'expense' | 'income'))
				.orderBy(asc(categories.order))
		: db.select().from(categories).orderBy(asc(categories.order));

	const result = await query;
	return json(result);
};
