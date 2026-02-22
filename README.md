# 家計簿アプリ (kakeibo-antigrav)

直感的でモバイルライクな操作感を目指した、PWA対応の家計簿・支出管理アプリケーションです。

## ✨ 主な機能 (Features)
- **ホーム（入力）画面**:
  - カスタマイズされたテンキーによる素早い金額入力
  - 複数明細（Line Item）の追加・編集機能
- **カレンダー画面**:
  - 月ごとの収入・支出合計のサマリー表示
  - 各日付ごとのトランザクション（レシートと明細）をアコーディオン形式で表示
- **分析・レポート画面**:
  - 任意の期間（月別、年別、全期間）におけるカテゴリ別の支出・収入内訳をグラフ表示（棒グラフ・円グラフ）
- **検索機能**:
  - キーワードによるレシートや明細メモの部分一致検索、および検索結果のサマリー計算
- **バックアップ・設定**:
  - カテゴリの自由な追加・編集・削除・並び替え（ドラッグ＆ドロップ対応）
  - CSVエクスポートおよびインポート（他フォーマットからの移行時の自動カテゴリ生成）機能

## 🛠 技術スタック (Tech Stack)
### Frontend
- **フレームワーク**: [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
- **スタイリング**: [Tailwind CSS v4](https://tailwindcss.com/)
- **アイコン**: [Lucide Svelte](https://lucide.dev/)
- **グラフ・チャート**: [Chart.js](https://www.chartjs.org/)

### Backend / Database
- **API**: SvelteKit API Routes / Server Actions
- **データベース**: [PostgreSQL](https://www.postgresql.org/) (Docker Compose で提供)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)

### DevOps / CI
- **Lint & Format**: ESLint v9, Prettier
- **Testing**: Vitest, Playwright
- **CI**: GitHub Actions

## 🚀 ローカルでのセットアップ (Getting Started)

### 1. 必要要件
- Node.js (v22 推奨)
- Docker および Docker Compose (DB用)
- PostgreSQL クライアント (オプショナル)

### 2. 環境構築
```bash
# クローン
git clone https://github.com/clagon/kakeibo-antigrav.git
cd kakeibo-antigrav

# 依存関係のインストール
npm install

# PostgreSQL コンテナの起動（バックグラウンド）
docker-compose up -d

# マイグレーションおよび初期シードデータの投入
npm run db:push
npm run db:seed
```

### 3. 開発サーバーの起動
```bash
npm run dev
```
ブラウザで [http://localhost:5173/](http://localhost:5173/) にアクセスしてください。

## 📁 ドキュメント (Documentation)
プロジェクトのアーキテクチャや各フェーズにおける詳細な設計仕様については、プロジェクトルートの `docs/` ディレクトリ配下に格納されています（Phase 1 〜 Phase 12）。
