import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/server/db';
import { categories, lineItems } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';

/** カテゴリー更新 (name/icon/color/order) */
export const PATCH: RequestHandler = async ({ params, request }) => {
	const { id } = params;
	const body = await request.json();

	const updates: Partial<{ name: string; icon: string; color: string; order: number }> = {};
	if (body.name !== undefined) updates.name = body.name;
	if (body.icon !== undefined) updates.icon = body.icon;
	if (body.color !== undefined) updates.color = body.color;
	if (body.order !== undefined) updates.order = body.order;

	const updated = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();

	if (updated.length === 0) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	return json(updated[0]);
};

/** カテゴリー削除（使用中の場合は 409） */
export const DELETE: RequestHandler = async ({ params }) => {
	const { id } = params;

	// 使用中の明細が存在するか確認
	const usageResult = await db
		.select({ cnt: count() })
		.from(lineItems)
		.where(eq(lineItems.categoryId, id));

	const usageCount = usageResult[0]?.cnt ?? 0;
	if (usageCount > 0) {
		return json(
			{ error: `このカテゴリーは ${usageCount} 件の明細で使用中のため削除できません。` },
			{ status: 409 }
		);
	}

	const deleted = await db.delete(categories).where(eq(categories.id, id)).returning();

	if (deleted.length === 0) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	return new Response(null, { status: 204 });
};
