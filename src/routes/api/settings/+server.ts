import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/server/db';
import { appSettings } from '$lib/server/db/schema';
import { readFileSync } from 'fs';
import { join } from 'path';

/** 設定取得（なければ初期レコードを作成） */
export const GET: RequestHandler = async () => {
	const rows = await db.select().from(appSettings).limit(1);
	const pkgPath = join(process.cwd(), 'package.json');
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

	if (rows.length > 0) {
		return json({
			...rows[0],
			version: pkg.version
		});
	}

	// 初回: デフォルト設定を INSERT
	const inserted = await db
		.insert(appSettings)
		.values({ initialBalance: 0, weekStartDay: 1 })
		.returning();
	return json({
		...inserted[0],
		version: pkg.version
	});
};

/** 設定更新 */
export const PATCH: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { initialBalance, weekStartDay } = body as {
		initialBalance?: number;
		weekStartDay?: number;
	};

	// 既存レコードを取得（なければ作成）
	const rows = await db.select().from(appSettings).limit(1);
	let id: string;

	if (rows.length === 0) {
		const inserted = await db
			.insert(appSettings)
			.values({ initialBalance: 0, weekStartDay: 1 })
			.returning();
		id = inserted[0].id;
	} else {
		id = rows[0].id;
	}

	const updates: Partial<{ initialBalance: number; weekStartDay: number }> = {};
	if (initialBalance !== undefined) updates.initialBalance = initialBalance;
	if (weekStartDay !== undefined) updates.weekStartDay = weekStartDay;

	const { eq } = await import('drizzle-orm');
	const updated = await db
		.update(appSettings)
		.set(updates)
		.where(eq(appSettings.id, id))
		.returning();

	return json(updated[0]);
};
