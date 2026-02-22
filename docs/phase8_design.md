# Phase 8: 設定画面の実装

## 概要

設定画面（その他タブ）を実装します。3つのセクションで構成します。

1. **全般設定** — 初期残高・週開始曜日
2. **カテゴリー設定** — 支出/収入カテゴリーの追加・削除・並び替え
3. **ヘルプ / バージョン情報**

---

## 提案する変更

### API 層

#### [NEW] `src/routes/api/settings/+server.ts`
- `GET` — `app_settings` レコードを返す（初回は INSERT してから返す）
- `PATCH` — `initialBalance`, `weekStartDay` を更新

#### [MODIFY] `src/routes/api/categories/+server.ts`
- `POST` — カテゴリー追加（name, icon, color, type）

#### [NEW] `src/routes/api/categories/[id]/+server.ts`
- `PATCH` — カテゴリー更新（name, icon, color）または order 一括更新
- `DELETE` — カテゴリー削除（使用中の明細がある場合は 409 エラーで拒否）

---

### コンポーネント層

#### [NEW] `src/lib/components/settings/CategoryEditModal.svelte`
カテゴリー追加モーダル。
- カテゴリー名入力
- アイコン選択（Lucide アイコングリッド from the existing icon set）
- カラープリセット選択
- 支出 / 収入の選択

#### [NEW] `src/lib/components/settings/CategoryRow.svelte`
カテゴリー一覧の行コンポーネント。
- アイコン・色・名前の表示
- **編集ボタン**（CategoryEditModal を開く）
- 削除ボタン（使用中の場合はトースト通知）
- ドラッグハンドル

---

### 画面

#### [MODIFY] `src/routes/settings/+page.svelte`
**a. 全般設定セクション**
- 初期残高（数値入力、変更時に API PATCH）
- 週開始曜日（**月曜始まり / 日曜始まり** のセレクト）

**b. カテゴリー設定セクション**
- 支出 / 収入 タブ切り替え
- カテゴリー行リスト（`CategoryRow`）
- ＋ボタンで `CategoryEditModal` を表示
- D&D 並び替え（SortableJS）→ 完了後に `PATCH /api/categories/[id]` で order 一括保存

**c. ヘルプ / バージョン情報セクション**
- アプリバージョン（`package.json` から取得）
- 利用規約ページ（`/settings/terms`）へのリンク行
- プライバシーポリシーページ（`/settings/privacy`）へのリンク行

> [!NOTE]
> 利用規約・プライバシーポリシーは静的コンテンツの SvelteKit ページとして作成します（`+page.svelte` に Markdown 相当の内容を直書き）。

---

## 検証計画

### 自動テスト
```
npm run lint && npm run build
```

### 手動確認ポイント
- 全般設定の保存が DB に反映されること
- カテゴリーの追加・削除が正しく動作すること
- D&D による並び替えが保存されること
