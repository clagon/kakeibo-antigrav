# Phase 6: レシート編集・削除機能

## 1. 概要

現在、カレンダー画面で明細を長押しすると `/?edit_receipt=[receiptId]` のパラメーター付きで入力画面 (`/`) に遷移するよう実装されています。
本フェーズでは、入力画面にてこのパラメーターを受け取り、既存レシートのデータを読み込んで編集、更新（PUT）および削除（DELETE）できる機能を実装します。

## 2. APIの追加・修正

特定のレシートを操作するためのエンドポイントを新設します。

**ファイル:** `src/routes/api/receipts/[id]/+server.ts`

- **GET**:
  - 用途: 入力画面ロード時に対象レシートの情報を取得
  - レスポンス: レシート本体情報 + 紐づく明細(`lineItems`)とカテゴリー情報を含むJSON

- **PUT**:
  - 用途: レシートと明細の更新
  - 処理:
    - レシートテーブル(`receipts`)の `date`, `type`, `memo`, `updatedAt` を更新
    - 既存の明細(`lineItems`)を一度全削除し、リクエストで渡された新しい明細を挿入する（トランザクション処理）

- **DELETE**:
  - 用途: レシートの削除
  - 処理: レシート本体を削除 (`schema.ts` で `onDelete: 'cascade'` が設定されているため、明細も連動して削除される想定)

## 3. 画面の修正 (+page.svelte)

**対象ファイル:** `src/routes/+page.svelte` (入力画面)

1. **初期データ読み込み**
   - ページ読み込み時の `$effect` 処理を拡張し、`$page.url.searchParams.get('edit_receipt')` が存在する場合、API(`GET /api/receipts/[id]`)からデータを取得する。
   - 取得完了後、状態（`date`, `activeTab`, `memo`, `lineItems`, `editingReceiptId`）を更新して画面に反映させる。

2. **UI要素の追加**
   - 編集モード（`editingReceiptId` が存在する場合）であることを示す表示（例: 「（編集中）」のテキストや、ヘッダーに「削除」アイコンボタンを配置）。

3. **保存処理の分岐**
   - 保存ボタン押下時、`editingReceiptId` がある場合は `PUT /api/receipts/[id]` へリクエスト。
   - 無い場合は従来の通り `POST /api/receipts` へリクエスト。
   - 成功後、直前の画面に戻る処理（例: 遷移元であるカレンダー画面に戻る）を実行する。

4. **削除処理の追加**
   - 「削除」ボタン押下時に、専用の確認ダイアログ（コンポーネントを新規作成、`ConfirmDialog.svelte`等）を表示。
   - 承認時、`DELETE /api/receipts/[id]` を呼び出し、成功したら直前の画面に戻る。
