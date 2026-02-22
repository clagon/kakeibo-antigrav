import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import db from '$lib/server/db';
import { receipts, lineItems, categories } from '$lib/server/db/schema';
import { eq, and, gte, lte, inArray, desc } from 'drizzle-orm';

export async function GET({ url }: RequestEvent) {
	const yearStr = url.searchParams.get('year');
	const monthStr = url.searchParams.get('month');

	if (!yearStr || !monthStr) {
		return json({ error: 'Year and month are required' }, { status: 400 });
	}

	const year = parseInt(yearStr, 10);
	const month = parseInt(monthStr, 10);

	if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
		return json({ error: 'Invalid year or month' }, { status: 400 });
	}

	// YYYY-MM-DD 形式の日付文字列を生成
	const paddedMonth = month.toString().padStart(2, '0');
	// 翌月の0日を指定することで、当月の末日を取得 (JavaScriptのDateの仕様)
	const daysInMonth = new Date(year, month, 0).getDate();
	const startDate = `${year}-${paddedMonth}-01`;
	const endDate = `${year}-${paddedMonth}-${daysInMonth}`;

	// レシート取得 (日付の降順)
	const monthReceipts = await db
		.select()
		.from(receipts)
		.where(and(gte(receipts.date, startDate), lte(receipts.date, endDate)))
		.orderBy(desc(receipts.date), desc(receipts.createdAt));

	if (monthReceipts.length === 0) {
		return json([]);
	}

	const receiptIds = monthReceipts.map((r) => r.id);

	// 明細とカテゴリーを一括取得
	const itemsWithCategories = await db
		.select({
			lineItem: lineItems,
			category: categories
		})
		.from(lineItems)
		.innerJoin(categories, eq(lineItems.categoryId, categories.id))
		.where(inArray(lineItems.receiptId, receiptIds))
		// 明細は作成順に並べる
		.orderBy(lineItems.createdAt);

	// レシートIDで明細をグルーピング
	const itemsByReceiptId = itemsWithCategories.reduce(
		(acc, row) => {
			const rid = row.lineItem.receiptId;
			if (!acc[rid]) {
				acc[rid] = [];
			}
			// Svelte 側で扱いやすいように結合
			acc[rid].push({
				...row.lineItem,
				category: row.category
			});
			return acc;
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		{} as Record<string, any[]>
	);

	// レシートデータに明細を詰め込んで返却
	const result = monthReceipts.map((r) => ({
		...r,
		items: itemsByReceiptId[r.id] || []
	}));

	return json(result);
}
