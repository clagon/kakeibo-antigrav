import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import db from '$lib/server/db';
import { receipts, lineItems, categories } from '$lib/server/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

// カテゴリー別集計の型
interface CategoryBreakdown {
	categoryId: string;
	name: string;
	icon: string;
	color: string;
	amount: number;
	percent: number;
}

// 時系列データの型
interface TimeSeriesItem {
	label: string;
	amount: number;
}

export async function GET({ url }: RequestEvent) {
	const mode = url.searchParams.get('mode') as 'month' | 'year' | 'all' | null;
	const yearStr = url.searchParams.get('year');
	const monthStr = url.searchParams.get('month');
	const type = url.searchParams.get('type') as 'expense' | 'income' | null;

	if (!mode || !type) {
		return json({ error: 'mode and type are required' }, { status: 400 });
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
	// mode === 'all' の場合は日付フィルタなし

	// WHERE 条件を構築
	const conditions = [eq(receipts.type, type)];
	if (startDate && endDate) {
		conditions.push(gte(receipts.date, startDate), lte(receipts.date, endDate));
	}

	// カテゴリー別集計クエリ
	const categoryRows = await db
		.select({
			categoryId: categories.id,
			name: categories.name,
			icon: categories.icon,
			color: categories.color,
			amount: sql<number>`cast(sum(${lineItems.amount}) as int)`
		})
		.from(lineItems)
		.innerJoin(receipts, eq(lineItems.receiptId, receipts.id))
		.innerJoin(categories, eq(lineItems.categoryId, categories.id))
		.where(and(...conditions))
		.groupBy(categories.id, categories.name, categories.icon, categories.color)
		.orderBy(sql`sum(${lineItems.amount}) desc`);

	// 合計金額
	const total = categoryRows.reduce((sum, row) => sum + (row.amount ?? 0), 0);

	// パーセンテージを計算
	const categoryBreakdown: CategoryBreakdown[] = categoryRows.map((row) => ({
		categoryId: row.categoryId,
		name: row.name,
		icon: row.icon,
		color: row.color,
		amount: row.amount ?? 0,
		percent: total > 0 ? Math.round(((row.amount ?? 0) / total) * 1000) / 10 : 0
	}));

	// 時系列データを生成
	let timeSeries: TimeSeriesItem[] = [];

	if (mode === 'month' && yearStr && monthStr) {
		// 週別集計
		const year = parseInt(yearStr, 10);
		const month = parseInt(monthStr, 10);
		const daysInMonth = new Date(year, month, 0).getDate();
		const weekCount = Math.ceil(daysInMonth / 7);
		const weeklyAmounts: number[] = Array(weekCount).fill(0);

		const dailyRows = await db
			.select({
				date: receipts.date,
				amount: sql<number>`cast(sum(${lineItems.amount}) as int)`
			})
			.from(lineItems)
			.innerJoin(receipts, eq(lineItems.receiptId, receipts.id))
			.where(and(...conditions))
			.groupBy(receipts.date)
			.orderBy(receipts.date);

		for (const row of dailyRows) {
			const day = parseInt(row.date.slice(-2), 10);
			const weekIndex = Math.min(Math.ceil(day / 7) - 1, weekCount - 1);
			weeklyAmounts[weekIndex] += row.amount ?? 0;
		}

		timeSeries = weeklyAmounts.map((amount, i) => ({
			label: `第${i + 1}週`,
			amount
		}));
	} else if (mode === 'year' && yearStr) {
		// 月別集計
		const monthlyAmounts: number[] = Array(12).fill(0);
		const year = parseInt(yearStr, 10);

		const monthlyRows = await db
			.select({
				date: receipts.date,
				amount: sql<number>`cast(sum(${lineItems.amount}) as int)`
			})
			.from(lineItems)
			.innerJoin(receipts, eq(lineItems.receiptId, receipts.id))
			.where(
				and(
					eq(receipts.type, type),
					gte(receipts.date, `${year}-01-01`),
					lte(receipts.date, `${year}-12-31`)
				)
			)
			.groupBy(receipts.date)
			.orderBy(receipts.date);

		for (const row of monthlyRows) {
			const month = parseInt(row.date.slice(5, 7), 10) - 1;
			monthlyAmounts[month] += row.amount ?? 0;
		}

		timeSeries = monthlyAmounts.map((amount, i) => ({
			label: `${i + 1}月`,
			amount
		}));
	} else if (mode === 'all') {
		// 年別集計
		const yearlyRows = await db
			.select({
				year: sql<string>`to_char(${receipts.date}::date, 'YYYY')`,
				amount: sql<number>`cast(sum(${lineItems.amount}) as int)`
			})
			.from(lineItems)
			.innerJoin(receipts, eq(lineItems.receiptId, receipts.id))
			.where(eq(receipts.type, type))
			.groupBy(sql`to_char(${receipts.date}::date, 'YYYY')`)
			.orderBy(sql`to_char(${receipts.date}::date, 'YYYY')`);

		timeSeries = yearlyRows.map((row) => ({
			label: `${row.year}年`,
			amount: row.amount ?? 0
		}));
	}

	return json({ total, categoryBreakdown, timeSeries });
}
