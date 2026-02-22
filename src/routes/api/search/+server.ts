import { json } from '@sveltejs/kit';
import db from '$lib/server/db';
import { receipts, lineItems, categories } from '$lib/server/db/schema';
import { eq, or, like, desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');

	if (!query || query.trim() === '') {
		return json([]);
	}

	const searchKeyword = `%${query}%`;

	try {
		// 指定されたキーワードが レシートメモ または 明細メモ に含まれる明細を抽出
		const results = await db
			.select({
				receipt: receipts,
				item: lineItems,
				category: categories
			})
			.from(receipts)
			.leftJoin(lineItems, eq(receipts.id, lineItems.receiptId))
			.leftJoin(categories, eq(lineItems.categoryId, categories.id))
			.where(or(like(receipts.memo, searchKeyword), like(lineItems.memo, searchKeyword)))
			.orderBy(desc(receipts.date));

		// レシート単位にグループ化
		type SearchReceipt = typeof receipts.$inferSelect & {
			items: Array<typeof lineItems.$inferSelect & { category: typeof categories.$inferSelect }>;
		};
		const receiptMap = new Map<string, SearchReceipt>();

		for (const row of results) {
			if (!row.receipt) continue;

			if (!receiptMap.has(row.receipt.id)) {
				receiptMap.set(row.receipt.id, {
					...row.receipt,
					items: []
				});
			}

			if (row.item && row.category) {
				const r = receiptMap.get(row.receipt.id)!;
				// 重複追加を防ぐ (LEFT JOINにより複数HITした際のCartesian対策)
				if (!r.items.some((i) => i.id === row.item!.id)) {
					r.items.push({
						...row.item,
						category: row.category
					});
				}
			}
		}

		// 値を配列にして日付順（降順）のまま返す
		return json(Array.from(receiptMap.values()));
	} catch (err) {
		console.error('Search API Error:', err);
		return json({ error: 'Failed to search data' }, { status: 500 });
	}
};
