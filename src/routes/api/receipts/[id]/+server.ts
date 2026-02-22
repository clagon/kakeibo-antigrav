import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import db from '$lib/server/db';
import { receipts, lineItems, categories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 特定のレシートと明細を取得する
 */
export async function GET({ params }: RequestEvent) {
	const receiptId = params.id;

	const receiptOpt = await db.select().from(receipts).where(eq(receipts.id, receiptId)).limit(1);
	if (receiptOpt.length === 0) {
		return json({ error: 'Receipt not found' }, { status: 404 });
	}

	const receiptData = receiptOpt[0];

	// 明細とカテゴリーをJoinして取得
	const itemsWithCategories = await db
		.select({
			lineItem: lineItems,
			category: categories
		})
		.from(lineItems)
		.innerJoin(categories, eq(lineItems.categoryId, categories.id))
		.where(eq(lineItems.receiptId, receiptId))
		.orderBy(lineItems.createdAt);

	return json({
		...receiptData,
		items: itemsWithCategories.map((row) => ({
			id: row.lineItem.id, // ドラフトと同じID構造としてセット
			categoryId: row.category.id,
			categoryName: row.category.name,
			categoryIcon: row.category.icon,
			categoryColor: row.category.color,
			memo: row.lineItem.memo,
			amount: row.lineItem.amount
		}))
	});
}

/**
 * レシートと明細の更新 (PUT)
 * 一旦既存の明細を消して新しいものを挿入する
 */
export async function PUT({ params, request }: RequestEvent) {
	const receiptId = params.id;
	const body = await request.json();
	const { date, type, memo, items } = body;

	if (!date || !type || !items || !Array.isArray(items)) {
		return json({ error: 'Invalid data' }, { status: 400 });
	}

	try {
		await db.transaction(async (tx) => {
			// 1. レシート本体の更新
			await tx
				.update(receipts)
				.set({
					date,
					type,
					memo: memo || '',
					updatedAt: new Date()
				})
				.where(eq(receipts.id, receiptId));

			// 2. 既存の明細を削除
			await tx.delete(lineItems).where(eq(lineItems.receiptId, receiptId));

			// 3. 新しい明細を追加
			if (items.length > 0) {
				const lineItemValues = items.map((item) => ({
					receiptId,
					categoryId: item.categoryId,
					memo: item.memo || '',
					amount: item.amount
				}));
				await tx.insert(lineItems).values(lineItemValues);
			}
		});

		return json({ success: true });
	} catch (e) {
		console.error('Failed to update receipt:', e);
		return json({ error: 'Failed to update receipt' }, { status: 500 });
	}
}

/**
 * レシートの削除 (DELETE)
 */
export async function DELETE({ params }: RequestEvent) {
	const receiptId = params.id;
	try {
		// schema.ts にて onDelete: 'cascade' 設定により、
		// レシート削除とともに lineItems も消層される
		await db.delete(receipts).where(eq(receipts.id, receiptId));
		return json({ success: true });
	} catch (e) {
		console.error('Failed to delete receipt:', e);
		return json({ error: 'Failed to delete receipt' }, { status: 500 });
	}
}
