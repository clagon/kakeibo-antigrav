import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/server/db';
import { receipts, lineItems } from '$lib/server/db/schema';

/** レシートの型定義 */
interface ReceiptPayload {
	date: string;
	type: 'expense' | 'income';
	memo: string;
	items: {
		categoryId: string;
		memo: string;
		amount: number;
	}[];
}

/** レシート保存 API */
export const POST: RequestHandler = async ({ request }) => {
	const body: ReceiptPayload = await request.json();

	// バリデーション
	if (!body.date || !body.type || !body.items || body.items.length === 0) {
		return json({ error: '必須項目が不足しています' }, { status: 400 });
	}

	// トランザクションでレシート + 明細を一括保存
	const result = await db.transaction(async (tx) => {
		// レシート挿入
		const [receipt] = await tx
			.insert(receipts)
			.values({
				date: body.date,
				type: body.type,
				memo: body.memo || ''
			})
			.returning();

		// 明細挿入
		const itemValues = body.items.map((item) => ({
			receiptId: receipt.id,
			categoryId: item.categoryId,
			memo: item.memo || '',
			amount: item.amount
		}));

		await tx.insert(lineItems).values(itemValues);

		return receipt;
	});

	return json(result, { status: 201 });
};
