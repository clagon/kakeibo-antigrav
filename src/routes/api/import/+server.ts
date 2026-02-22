import { json } from '@sveltejs/kit';
import db from '$lib/server/db';
import { receipts, lineItems, categories } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

function parseCSV(text: string): string[][] {
	const rows: string[][] = [];
	let currentRow: string[] = [];
	let currentCell = '';
	let inQuotes = false;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		if (inQuotes) {
			if (char === '"') {
				if (i + 1 < text.length && text[i + 1] === '"') {
					currentCell += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				currentCell += char;
			}
		} else {
			if (char === '"') {
				inQuotes = true;
			} else if (char === ',') {
				currentRow.push(currentCell);
				currentCell = '';
			} else if (char === '\n' || char === '\r') {
				currentRow.push(currentCell);
				rows.push(currentRow);
				currentRow = [];
				currentCell = '';
				if (char === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
					i++;
				}
			} else {
				currentCell += char;
			}
		}
	}
	if (currentCell !== '' || currentRow.length > 0) {
		currentRow.push(currentCell);
		rows.push(currentRow);
	}

	return rows;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file');

		if (!(file instanceof File)) {
			return json({ error: 'ファイルが選択されていません' }, { status: 400 });
		}

		const text = await file.text();
		const rows = parseCSV(text);

		if (rows.length < 2) {
			return json({ error: 'データが含まれていないか、形式が間違っています' }, { status: 400 });
		}

		// 7列: レシートID,日付,収支区分,レシートメモ,カテゴリ,金額,明細メモ
		// 1行目はヘッダーとしてスキップ。空行も除外
		const dataRows = rows
			.slice(1)
			.filter((r) => r.length >= 7 && (r[0].trim() !== '' || r[1].trim() !== ''));

		const existingCats = await db.select().from(categories);
		const catMap = new Map<string, string>(); // `name:type` -> id
		existingCats.forEach((c) => catMap.set(`${c.name}:${c.type}`, c.id));

		async function getOrCreateCategory(name: string, type: 'expense' | 'income'): Promise<string> {
			const catName = name.trim() || '未分類';
			const key = `${catName}:${type}`;
			if (catMap.has(key)) return catMap.get(key)!;

			// 見つからない場合は新規作成
			const [newCat] = await db
				.insert(categories)
				.values({
					name: catName,
					type,
					icon: 'circle',
					color: '#94a3b8'
				})
				.returning();

			catMap.set(key, newCat.id);
			return newCat.id;
		}

		type ParsedItem = {
			receiptId: string | null;
			date: string;
			type: 'expense' | 'income';
			receiptMemo: string;
			categoryId: string;
			amount: number;
			memo: string;
		};
		const parsedItems: ParsedItem[] = [];

		for (const row of dataRows) {
			const receiptId = row[0]?.trim() || null;
			const date = row[1]?.trim() || '';
			const type = row[2]?.trim() as 'expense' | 'income';
			const receiptMemo = row[3]?.trim() || '';
			const catName = row[4]?.trim() || '未分類';
			const amount = parseInt(row[5]?.trim() || '0', 10);
			const memo = row[6]?.trim() || '';

			if (!date || (type !== 'expense' && type !== 'income') || isNaN(amount)) {
				continue; // 不正なデータはスキップ
			}

			const categoryId = await getOrCreateCategory(catName, type);
			parsedItems.push({
				receiptId,
				date,
				type,
				receiptMemo,
				categoryId,
				amount,
				memo
			});
		}

		if (parsedItems.length === 0) {
			return json({ error: 'インポート可能な有効なデータが見つかりませんでした' }, { status: 400 });
		}

		// グループ化: レシートIDがある場合はIDでグループ化。
		// レシートIDがない（空の）場合は、1行につき1つの独立したキーを割り当て、1明細＝1レシートとして作成する。
		const groups = new Map<string, ParsedItem[]>();
		for (let i = 0; i < parsedItems.length; i++) {
			const item = parsedItems[i];
			const key = item.receiptId ? `id:${item.receiptId}` : `single:${i}`;
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key)!.push(item);
		}

		// DBに挿入
		await db.transaction(async (tx) => {
			for (const items of groups.values()) {
				// groups.values() に入っている配列の要素は少なくとも1つ以上あり、date と type は同じレシート内では同一
				const firstItem = items[0];

				// メモはグループ内で最初に空でないものを採用する
				const combinedReceiptMemo = items.find((i) => i.receiptMemo)?.receiptMemo || '';

				const [newReceipt] = await tx
					.insert(receipts)
					.values({
						date: firstItem.date,
						type: firstItem.type,
						memo: combinedReceiptMemo
					})
					.returning();

				for (const item of items) {
					await tx.insert(lineItems).values({
						receiptId: newReceipt.id,
						categoryId: item.categoryId,
						amount: item.amount,
						memo: item.memo
					});
				}
			}
		});

		return json({ success: true, message: `${parsedItems.length}件のデータをインポートしました` });
	} catch (err) {
		console.error('Import Error:', err);
		return json({ error: 'インポート処理中にエラーが発生しました' }, { status: 500 });
	}
};
