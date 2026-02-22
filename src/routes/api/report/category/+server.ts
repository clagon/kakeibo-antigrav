import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import db from '$lib/server/db';
import { receipts, lineItems, categories } from '$lib/server/db/schema';
import { eq, and, gte, lte, sql, inArray } from 'drizzle-orm';

export async function GET({ url }: RequestEvent) {
	const mode = url.searchParams.get('mode') as 'month' | 'year' | 'all' | null;
	const yearStr = url.searchParams.get('year');
	const monthStr = url.searchParams.get('month');
	const type = url.searchParams.get('type') as 'expense' | 'income' | null;
	const categoryId = url.searchParams.get('categoryId');

	if (!mode || !type || !categoryId) {
		return json({ error: 'mode, type, categoryId are required' }, { status: 400 });
	}

	// 日付範囲を計算
	let startDate: string | null = null;
	let endDate: string | null = null;

	if (mode === 'month') {
		if (!yearStr || !monthStr) {
			return json({ error: 'year and month are required for month mode' }, { status: 400 });
		}
		const year = parseInt(yearStr, 10);
		const month = parseInt(monthStr, 10);
		const paddedMonth = month.toString().padStart(2, '0');
		const daysInMonth = new Date(year, month, 0).getDate();
		startDate = `${year}-${paddedMonth}-01`;
		endDate = `${year}-${paddedMonth}-${daysInMonth.toString().padStart(2, '0')}`;
	} else if (mode === 'year') {
		if (!yearStr) {
			return json({ error: 'year is required for year mode' }, { status: 400 });
		}
		const year = parseInt(yearStr, 10);
		startDate = `${year}-01-01`;
		endDate = `${year}-12-31`;
	}

	// 基本的な WHERE 条件
	const baseCond = [eq(receipts.type, type), eq(lineItems.categoryId, categoryId)];
	if (startDate && endDate) {
		baseCond.push(gte(receipts.date, startDate), lte(receipts.date, endDate));
	}

	// ---- 時系列データ ----
	interface TimeSeriesItem {
		label: string;
		amount: number;
	}
	let timeSeries: TimeSeriesItem[] = [];

	if (mode === 'month' && yearStr && monthStr) {
		const year = parseInt(yearStr, 10);
		const month = parseInt(monthStr, 10);
		const daysInMonth = new Date(year, month, 0).getDate();
		const weekCount = Math.ceil(daysInMonth / 7);
		const weeklyAmounts: number[] = Array(weekCount).fill(0);

		const dailyRows = await db
			.select({ date: receipts.date, amount: sql<number>`cast(sum(${lineItems.amount}) as int)` })
			.from(lineItems)
			.innerJoin(receipts, eq(lineItems.receiptId, receipts.id))
			.where(and(...baseCond))
			.groupBy(receipts.date)
			.orderBy(receipts.date);

		for (const row of dailyRows) {
			const day = parseInt(row.date.slice(-2), 10);
			const weekIndex = Math.min(Math.ceil(day / 7) - 1, weekCount - 1);
			weeklyAmounts[weekIndex] += row.amount ?? 0;
		}
		timeSeries = weeklyAmounts.map((amount, i) => ({ label: `第${i + 1}週`, amount }));
	} else if (mode === 'year' && yearStr) {
		const monthlyAmounts: number[] = Array(12).fill(0);
		const dailyRows = await db
			.select({ date: receipts.date, amount: sql<number>`cast(sum(${lineItems.amount}) as int)` })
			.from(lineItems)
			.innerJoin(receipts, eq(lineItems.receiptId, receipts.id))
			.where(and(...baseCond))
			.groupBy(receipts.date)
			.orderBy(receipts.date);

		for (const row of dailyRows) {
			const m = parseInt(row.date.slice(5, 7), 10) - 1;
			monthlyAmounts[m] += row.amount ?? 0;
		}
		timeSeries = monthlyAmounts.map((amount, i) => ({ label: `${i + 1}月`, amount }));
	} else if (mode === 'all') {
		const yearlyRows = await db
			.select({
				year: sql<string>`to_char(${receipts.date}::date, 'YYYY')`,
				amount: sql<number>`cast(sum(${lineItems.amount}) as int)`
			})
			.from(lineItems)
			.innerJoin(receipts, eq(lineItems.receiptId, receipts.id))
			.where(and(eq(receipts.type, type), eq(lineItems.categoryId, categoryId)))
			.groupBy(sql`to_char(${receipts.date}::date, 'YYYY')`)
			.orderBy(sql`to_char(${receipts.date}::date, 'YYYY')`);
		timeSeries = yearlyRows.map((r) => ({ label: `${r.year}年`, amount: r.amount ?? 0 }));
	}

	// ---- 明細（line items）を取得 ----
	// 対象カテゴリーの明細が含まれるレシート ID を特定
	const matchingReceiptIds = await db
		.selectDistinct({ id: receipts.id })
		.from(lineItems)
		.innerJoin(receipts, eq(lineItems.receiptId, receipts.id))
		.where(and(...baseCond));

	if (matchingReceiptIds.length === 0) {
		return json({ timeSeries, lineItems: [] });
	}

	const ids = matchingReceiptIds.map((r) => r.id);

	// 対象カテゴリーの明細のみ取得（他カテゴリーは除外）
	const lineItemRows = await db
		.select({
			id: lineItems.id,
			date: receipts.date,
			receiptId: receipts.id,
			memo: lineItems.memo,
			amount: lineItems.amount,
			catId: categories.id,
			catName: categories.name,
			catIcon: categories.icon,
			catColor: categories.color
		})
		.from(lineItems)
		.innerJoin(receipts, eq(lineItems.receiptId, receipts.id))
		.innerJoin(categories, eq(lineItems.categoryId, categories.id))
		.where(and(inArray(receipts.id, ids), eq(lineItems.categoryId, categoryId)))
		.orderBy(receipts.date);

	const result = lineItemRows
		.map((row) => ({
			id: row.id,
			date: row.date,
			receiptId: row.receiptId,
			memo: row.memo ?? '',
			amount: row.amount,
			category: {
				id: row.catId,
				name: row.catName,
				icon: row.catIcon,
				color: row.catColor
			}
		}))
		.sort((a, b) => b.date.localeCompare(a.date));

	return json({ timeSeries, lineItems: result });
}
