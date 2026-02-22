# Phase 1: プロジェクト初期化 & 基盤 — 詳細設計書

## 概要

SvelteKit プロジェクトを初期化し、TailwindCSS v4・Google Fonts・PostgreSQL(Docker)・Drizzle ORM を設定する。

---

## 1. プロジェクト初期化

```bash
# SvelteKit プロジェクト作成（TypeScript, TailwindCSS 付き）
npx -y sv create ./ --template minimal --types ts --add tailwindcss --no-install
npm install
```

> [!NOTE]
> `sv create` は TailwindCSS v4 を `@tailwindcss/vite` プラグイン方式でセットアップします。`tailwind.config.js` は不要（CSS-first 設定）。

---

## 2. 追加パッケージインストール

```bash
# DB関連
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg

# チャート・アイコン・日付
npm install chart.js lucide-svelte date-fns
```

---

## 3. Docker Compose（開発用 PostgreSQL）

#### [NEW] [docker-compose.yml](file:///home/clagon/repos/kakeibo-antigrav/docker-compose.yml)

```yaml
services:
  db:
    image: postgres:17
    container_name: kakeibo-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: kakeibo
      POSTGRES_PASSWORD: kakeibo_dev
      POSTGRES_DB: kakeibo
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

#### [NEW] [.env](file:///home/clagon/repos/kakeibo-antigrav/.env)

```
DATABASE_URL=postgresql://kakeibo:kakeibo_dev@localhost:5432/kakeibo
```

`.env` は `.gitignore` に追加します。

---

## 4. Google Fonts 設定

#### [MODIFY] [app.html](file:///home/clagon/repos/kakeibo-antigrav/src/app.html)

`<head>` に以下を追加：

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
	href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&family=Noto+Sans+JP:wght@300;400;500;700&family=Roboto:wght@300;400;500;700&display=swap"
	rel="stylesheet"
/>
```

#### [MODIFY] [app.css](file:///home/clagon/repos/kakeibo-antigrav/src/app.css)

```css
@import 'tailwindcss';

@theme {
	--font-sans: 'Noto Sans JP', 'Roboto', sans-serif;
	--font-emoji: 'Noto Color Emoji', sans-serif;

	/* カラーパレット（モバイル家計簿向け） */
	--color-primary-50: #eff6ff;
	--color-primary-100: #dbeafe;
	--color-primary-500: #3b82f6;
	--color-primary-600: #2563eb;
	--color-primary-700: #1d4ed8;

	--color-expense: #ef4444;
	--color-income: #3b82f6;
	--color-balance: #10b981;

	--color-surface: #ffffff;
	--color-surface-alt: #f8fafc;
	--color-border: #e2e8f0;
	--color-text: #1e293b;
	--color-text-muted: #64748b;

	/* スペーシング */
	--spacing-nav-height: 4rem;
}
```

---

## 5. Drizzle ORM スキーマ定義

#### [NEW] [src/lib/server/db/schema.ts](file:///home/clagon/repos/kakeibo-antigrav/src/lib/server/db/schema.ts)

```typescript
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

// 設定テーブル
export const appSettings = pgTable('app_settings', {
	id: uuid('id').defaultRandom().primaryKey(),
	initialBalance: integer('initial_balance').notNull().default(0),
	weekStartDay: integer('week_start_day').notNull().default(1) // 1=月曜
});
```

#### [NEW] [src/lib/server/db/index.ts](file:///home/clagon/repos/kakeibo-antigrav/src/lib/server/db/index.ts)

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const db = drizzle(process.env.DATABASE_URL!, { schema });

export default db;
```

#### [NEW] [drizzle.config.ts](file:///home/clagon/repos/kakeibo-antigrav/drizzle.config.ts)

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './drizzle',
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!
	}
});
```

---

## 6. 型定義

#### [NEW] [src/lib/types/index.ts](file:///home/clagon/repos/kakeibo-antigrav/src/lib/types/index.ts)

```typescript
// Drizzle スキーマから推論する型（フロントエンド用）
export type TransactionType = 'expense' | 'income';

export interface CategoryData {
	id: string;
	name: string;
	icon: string;
	color: string;
	type: TransactionType;
	order: number;
}

export interface LineItemData {
	id: string;
	receiptId: string;
	categoryId: string;
	memo: string;
	amount: number;
}

export interface ReceiptData {
	id: string;
	date: string;
	type: TransactionType;
	memo: string;
	items: LineItemData[];
}

export interface AppSettingsData {
	initialBalance: number;
	weekStartDay: number;
}
```

---

## 7. 初期カテゴリーシードデータ

#### [NEW] [src/lib/server/db/seed.ts](file:///home/clagon/repos/kakeibo-antigrav/src/lib/server/db/seed.ts)

デフォルトの支出/収入カテゴリーを投入するスクリプト。

支出カテゴリー例：🍔食費、🚃交通費、🏠住居費、💡光熱費、👕衣服、🏥医療、📱通信費、🎮娯楽、📚教育、🎁その他

収入カテゴリー例：💰給与、💹副収入、🎁ボーナス、💸その他

---

## 8. 実行手順

```bash
# 1. Docker で PostgreSQL 起動
docker compose up -d

# 2. Drizzle マイグレーション生成 & 適用
npx drizzle-kit generate
npx drizzle-kit migrate

# 3. シードデータ投入
npx tsx src/lib/server/db/seed.ts

# 4. 開発サーバー起動
npm run dev
```

---

## 検証

- [ ] `docker compose up -d` で PostgreSQL コンテナが起動すること
- [ ] `npx drizzle-kit generate` でマイグレーションファイルが生成されること
- [ ] `npx drizzle-kit migrate` でテーブルが作成されること
- [ ] `npm run dev` でエラーなくローカル起動すること
- [ ] ブラウザでフォント（Noto Sans JP）が適用されていること
