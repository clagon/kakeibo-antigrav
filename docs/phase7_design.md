# Phase 7: レポート画面

カレンダー画面と並ぶ主要機能として、支出・収入の分析レポートを表示する画面を実装します。

---

## 画面仕様

### レイアウト概要

```
┌─────────────────────────────┐
│ PageHeader（レポート）       │
├─────────────────────────────┤
│ [月別] [年間] [全期間] ← 期間│
│ ◀ 2026年2月 ▶              │
│ [支出] [収入]  ← 収支タブ   │
├─────────────────────────────┤
│  📊 棒グラフ（月別推移）     │
│  ← 月別の場合は週別推移      │
├─────────────────────────────┤
│  📊 円グラフ（カテゴリー別） │
│  合計: ¥98,500              │
├─────────────────────────────┤
│  カテゴリー別内訳リスト      │
│  🍔 食費        ¥32,000 33% │
│  🏠 住居費      ¥25,000 25% │
│  ...                        │
└─────────────────────────────┘
```

### 機能詳細

| 機能              | 内容                                                               |
| ----------------- | ------------------------------------------------------------------ |
| **期間選択**      | 月別 / 年間 / 全期間の3モード（最上部）                            |
| **ナビゲーター**  | 月別→◀ YYYY年M月 ▶、年間→◀ YYYY年 ▶、全期間→非表示                 |
| **支出/収入タブ** | 期間の下に配置。各期間内で支出/収入を切り替え                      |
| **棒グラフ**      | 月別→週別推移（Bar）、年間→月別推移（Bar）、全期間→年別推移（Bar） |
| **円グラフ**      | カテゴリー別の割合。Chart.js の Doughnut チャート                  |
| **内訳リスト**    | カテゴリーごとの合計金額・割合・カラーバーを表示                   |

---

## API設計

### [NEW] `GET /api/report`

レポート用の集計データを一括取得するエンドポイント。

**クエリパラメータ:**

| パラメータ | 型                         | 説明                               |
| ---------- | -------------------------- | ---------------------------------- |
| `mode`     | `month` \| `year` \| `all` | 集計期間                           |
| `year`     | number                     | modeが`month`/`year`の場合に必須   |
| `month`    | number                     | modeが`month`の場合に必須（1〜12） |
| `type`     | `expense` \| `income`      | 支出または収入                     |

**レスポンス（month モード例）:**

```json
{
	"total": 98500,
	"categoryBreakdown": [
		{
			"categoryId": "...",
			"name": "食費",
			"icon": "Utensils",
			"color": "#ef4444",
			"amount": 32000,
			"percent": 32.5
		}
	],
	"timeSeries": [
		{ "label": "第1週", "amount": 25000 },
		{ "label": "第2週", "amount": 31000 },
		{ "label": "第3週", "amount": 22000 },
		{ "label": "第4週", "amount": 20500 }
	]
}
```

---

## 実装ファイル

---

### API

#### [NEW] [+server.ts](file:///home/clagon/repos/kakeibo-antigrav/src/routes/api/report/+server.ts)

- `mode` / `year` / `month` / `type` パラメータを受け取り集計を実行。
- **DBクエリ**: レシートと明細テーブルを JOIN し、カテゴリーごとに `SUM(amount)` を集計。
- **timeSeries の生成**:
  - `month` → 4〜5週分に振り分け（週 = `Math.ceil(day / 7)`）
  - `year` → 12カ月分
  - `all` → 年ごとに集計（`DATE_TRUNC('year', date)` で GROUP BY）

---

### コンポーネント

#### [NEW] [ReportChart.svelte](file:///home/clagon/repos/kakeibo-antigrav/src/lib/components/report/ReportChart.svelte)

Chart.js の `onMount` 初期化ラッパー。Doughnut / Bar を `props.type` で切り替える。

```
Props:
  type: 'doughnut' | 'bar'
  data: ChartData
  options?: ChartOptions
```

#### [NEW] [CategoryBreakdownList.svelte](file:///home/clagon/repos/kakeibo-antigrav/src/lib/components/report/CategoryBreakdownList.svelte)

カテゴリー別内訳のリスト。`categoryBreakdown` 配列を受け取り、アイコン・名前・金額・割合・カラーバーを表示。

---

### 画面本体

#### [MODIFY] [+page.svelte](file:///home/clagon/repos/kakeibo-antigrav/src/routes/report/+page.svelte)

- **状態管理**: `type`（支出/収入）、`mode`（月/年/全期間）、`year`、`month` を Svelte 5 runes で管理。
- **データ取得**: `$effect` で `/api/report` を呼び出し、状態変化時に自動再取得。
- **Chart.js 初期化**: `onMount` で Chart のインスタンスを生成し、`$effect` でデータ更新時に `chart.update()` を呼ぶ。

---

## 検証計画

### 自動テスト

```bash
npm run lint
npm run build
```

### 動作確認（ブラウザ）

- [ ] 支出/収入タブ切り替えで円グラフ・棒グラフが更新される
- [ ] 月/年/全期間の切り替えで棒グラフのラベルが変わる
- [ ] ◀▶ナビゲーターでデータが切り替わる
- [ ] データが 0 件の場合に「データなし」の表示が出る
