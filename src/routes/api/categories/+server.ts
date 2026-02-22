import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { eq, asc, max } from 'drizzle-orm';

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

/** カテゴリー追加 API */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const {
		name,
		icon,
		color,
		type
	}: { name: string; icon: string; color: string; type: 'expense' | 'income' } = body;

	// 同じ type の最大 order を取得して +1
	const result = await db
		.select({ maxOrder: max(categories.order) })
		.from(categories)
		.where(eq(categories.type, type));
	const nextOrder = (result[0]?.maxOrder ?? -1) + 1;

	const inserted = await db
		.insert(categories)
		.values({ name, icon, color, type, order: nextOrder })
		.returning();

	return json(inserted[0], { status: 201 });
};
