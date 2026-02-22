import {
	pgTable,
	uuid,
	varchar,
	integer,
	text,
	date,
	timestamp,
	pgEnum
} from 'drizzle-orm/pg-core';

// 支出/収入の列挙型
export const transactionTypeEnum = pgEnum('transaction_type', ['expense', 'income']);

// カテゴリーテーブル
export const categories = pgTable('categories', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	icon: varchar('icon', { length: 50 }).notNull(),
	color: varchar('color', { length: 20 }).notNull(),
	type: transactionTypeEnum('type').notNull(),
	order: integer('order').notNull().default(0),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// レシートテーブル
export const receipts = pgTable('receipts', {
	id: uuid('id').defaultRandom().primaryKey(),
	date: date('date').notNull(),
	type: transactionTypeEnum('type').notNull(),
	memo: text('memo').default(''),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// 明細テーブル
export const lineItems = pgTable('line_items', {
	id: uuid('id').defaultRandom().primaryKey(),
	receiptId: uuid('receipt_id')
		.references(() => receipts.id, { onDelete: 'cascade' })
		.notNull(),
	categoryId: uuid('category_id')
		.references(() => categories.id)
		.notNull(),
	memo: text('memo').default(''),
	amount: integer('amount').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// アプリ設定テーブル
export const appSettings = pgTable('app_settings', {
	id: uuid('id').defaultRandom().primaryKey(),
	initialBalance: integer('initial_balance').notNull().default(0),
	weekStartDay: integer('week_start_day').notNull().default(1) // 1=月曜
});
