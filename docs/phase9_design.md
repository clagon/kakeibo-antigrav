# Phase 9: 入力画面の明細編集機能

入力画面（`/`）で、追加済みの明細を編集・更新できる機能を実装します。

## 概要

既存の明細ドロワー（`LineItemDrawer`）を、「追加」モードから「編集（更新）」モードとしても動作するように拡張します。
また、明細リスト（`LineItemList`）で各項目をクリック可能にし、編集イベントを発火させます。

## Proposed Changes

### 1. `LineItemList.svelte`

- `items` のリスト要素をクリック（または編集ボタンを押下）した際に発火する `onedit` または `onclick` イベントを追加。
- ユーザーに編集可能であることを視覚的に伝えるため、ホバー効果や `cursor: pointer` 等のスタイルを追加。

#### [MODIFY] [LineItemList.svelte](file:///home/clagon/repos/kakeibo-antigrav/src/lib/components/LineItemList.svelte)

- Props に `onedit?: (item: LineItemDraft) => void;` を追加。
- 各 `.line-item` 要素に `onclick` イベントを付与（エンターキー対応など a11y への配慮も含む）。

### 2. `LineItemDrawer.svelte`

- 既存の項目を編集対象として受け取れるようにする。

#### [MODIFY] [LineItemDrawer.svelte](file:///home/clagon/repos/kakeibo-antigrav/src/lib/components/LineItemDrawer.svelte)

- Props に `editItem?: LineItemDraft | null;` を追加。
- `editItem` が渡された場合、`selectedCategory`、`amount`、`memo` の初期値をそれに合わせる。
- 保存ボタンのラベルを「追加」から、`editItem` がある場合は「更新」に変更。
- `onadd` コールバックを `onsave` にリネームするか、追加・更新で共通の処理とみなせるようにインターフェースを調整。

### 3. `+page.svelte` (入力画面)

- リストで項目がクリックされた際、それを「現在編集中の明細(`editingItem`)」としてドロワーに渡す。

#### [MODIFY] [+page.svelte](file:///home/clagon/repos/kakeibo-antigrav/src/routes/+page.svelte)

- 状態変数 `editingItem: LineItemDraft | null = $state(null);` を追加。
- リストから `onedit` イベントを受け取り、`editingItem` をセットしてから `isDrawerOpen = true` とする。
- ドロワーからのセーブイベントで、`editingItem` が存在すれば該当 `id` の項目を置換、存在しなければ新規追加するロジックに修正。
- 閉じた際に `editingItem` をクリアする。

## Verification Plan

### 自動テスト

- `npm run lint` および `npm run build` による検証。

### 手動検証

- 金額、メモ、カテゴリーを選択して明細を追加できること（既存機能のデグレがないこと）。
- 追加した明細をクリックするとドロワーが開き、登録済みの内容がフォームにセットされていること。
- ドロワーで内容を変更し「更新」を押すと、リスト上の明細が更新されること。
- ドロワーを途中で閉じた場合、内容は更新されず、次回の新規追加時はフォームがリセットされていること。
