import { error } from '@sveltejs/kit';
import db from '$lib/server/db';
import { receipts, lineItems, categories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

function escapeCSV(field: string | null | undefined): string {
	if (!field) return '';
	const str = String(field);
	if (/[,"\n\r]/.test(str)) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export const GET: RequestHandler = async () => {
	try {
		// DBから全データを明細単位で取得（レシート、カテゴリ情報を結合）
		const items = await db
			.select({
				receiptId: receipts.id,
				date: receipts.date,
				type: categories.type,
				receiptMemo: receipts.memo,
				categoryName: categories.name,
				amount: lineItems.amount,
				memo: lineItems.memo
			})
			.from(lineItems)
			.innerJoin(receipts, eq(lineItems.receiptId, receipts.id))
			.innerJoin(categories, eq(lineItems.categoryId, categories.id))
			.orderBy(receipts.date); // 日付順

		const header = 'レシートID,日付,収支区分,レシートメモ,カテゴリー,金額,明細メモ\n';
		const rows = items.map((item) => {
			return [
				item.receiptId,
				item.date,
				item.type,
				escapeCSV(item.receiptMemo),
				escapeCSV(item.categoryName),
				item.amount,
				escapeCSV(item.memo)
			].join(',');
		});

		const csvContent = header + rows.join('\n');

		// BOMを追加してExcel等の文字化けを防ぐ（UTF-8 BOM）
		const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
		const csvBlob = new Blob([bom, csvContent], { type: 'text/csv; charset=utf-8' });

		return new Response(csvBlob, {
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': 'attachment; filename="kakeibo_export.csv"'
			}
		});
	} catch (err) {
		console.error('Export Error:', err);
		throw error(500, 'エクスポート処理中にエラーが発生しました');
	}
};
