# Phase 2: 開発環境整備 — 詳細設計書

## 概要

ESLint、Prettier、Vitest（Unit Test）、Playwright（E2E Test）を導入し、コード品質を担保する開発環境を構築する。

---

## 1. sv add による一括追加

SvelteKit の公式 CLI `sv add` を使って ESLint・Prettier・Playwright を追加します。

```bash
npx sv add eslint prettier playwright
```

> [!NOTE]
> `sv add` は SvelteKit 公式が推奨する方法で、Svelte 5 向けの設定ファイルを自動生成します。

---

## 2. Vitest の手動セットアップ

`sv add` で Vitest がサポートされていない場合、手動で追加します。

```bash
npm install -D vitest @testing-library/svelte @testing-library/jest-dom jsdom
```

#### [NEW] [vitest.config.ts](file:///home/clagon/repos/kakeibo-antigrav/vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/tests/setup.ts']
	}
});
```

#### [NEW] [src/tests/setup.ts](file:///home/clagon/repos/kakeibo-antigrav/src/tests/setup.ts)

```typescript
import '@testing-library/jest-dom/vitest';
```

---

## 3. npm scripts 整備

#### [MODIFY] [package.json](file:///home/clagon/repos/kakeibo-antigrav/package.json)

以下のスクリプトを追加・確認：

```json
{
	"scripts": {
		"lint": "eslint .",
		"format": "prettier --write .",
		"format:check": "prettier --check .",
		"test": "vitest run",
		"test:watch": "vitest",
		"test:e2e": "playwright test"
	}
}
```

---

## 4. サンプルテスト作成

#### [NEW] [src/lib/utils/format.ts](file:///home/clagon/repos/kakeibo-antigrav/src/lib/utils/format.ts)

金額フォーマットなどのユーティリティ関数（テスト対象）。

#### [NEW] [src/lib/utils/format.test.ts](file:///home/clagon/repos/kakeibo-antigrav/src/lib/utils/format.test.ts)

ユニットテストのサンプル。

#### [NEW] [tests/home.test.ts](file:///home/clagon/repos/kakeibo-antigrav/tests/home.test.ts)

Playwright E2E テストのサンプル（トップページアクセス確認）。

---

## 5. .gitignore 追加

```
# Playwright
/test-results/
/playwright-report/
```

---

## 検証

- [ ] `npm run lint` が通ること
- [ ] `npm run format:check` が通ること
- [ ] `npm run test` でサンプルテストが通ること
- [ ] `npm run test:e2e` でサンプルE2Eテストが通ること
