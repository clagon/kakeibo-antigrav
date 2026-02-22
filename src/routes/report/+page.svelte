<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import ReportChart from '$lib/components/report/ReportChart.svelte';
	import CategoryBreakdownList from '$lib/components/report/CategoryBreakdownList.svelte';
	import type { CategoryBreakdown } from '$lib/components/report/CategoryBreakdownList.svelte';
	import MonthSummary from '$lib/components/calendar/MonthSummary.svelte';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface TimeSeriesItem {
		label: string;
		amount: number;
	}

	interface ReportData {
		total: number;
		categoryBreakdown: CategoryBreakdown[];
		timeSeries: TimeSeriesItem[];
	}

	// ---- 状態 ----
	type Mode = 'month' | 'year' | 'all';
	type TxType = 'expense' | 'income';

	let mode = $state<Mode>('month');
	let txType = $state<TxType>('expense');
	let year = $state(new Date().getFullYear());
	let month = $state(new Date().getMonth() + 1);

	let reportData = $state<ReportData | null>(null);
	let loading = $state(false);

	// ---- データ取得 ----
	async function fetchReport() {
		loading = true;
		reportData = null;

		const params = new SvelteURLSearchParams({ mode, type: txType });
		if (mode === 'month') {
			params.set('year', String(year));
			params.set('month', String(month));
		} else if (mode === 'year') {
			params.set('year', String(year));
		}

		try {
			const res = await fetch(`/api/report?${params}`);
			if (res.ok) {
				reportData = await res.json();
			}
		} finally {
			loading = false;
		}
	}

	// ---- 収支サマリー用状態 ----
	let expenseTotal = $state(0);
	let incomeTotal = $state(0);

	// 2つの API を並行フェッチ
	async function fetchBothTotals() {
		const buildParams = (t: TxType) => {
			const p = new SvelteURLSearchParams({ mode, type: t });
			if (mode === 'month') {
				p.set('year', String(year));
				p.set('month', String(month));
			} else if (mode === 'year') {
				p.set('year', String(year));
			}
			return p;
		};
		const [eRes, iRes] = await Promise.all([
			fetch(`/api/report?${buildParams('expense')}`),
			fetch(`/api/report?${buildParams('income')}`)
		]);
		if (eRes.ok) {
			const d = await eRes.json();
			expenseTotal = d.total ?? 0;
		}
		if (iRes.ok) {
			const d = await iRes.json();
			incomeTotal = d.total ?? 0;
		}
	}

	// 必要なら収支サマリーも同時取得
	async function fetchAll() {
		await Promise.all([fetchReport(), fetchBothTotals()]);
	}

	// 状態変化時に自動再取得
	$effect(() => {
		void mode;
		void txType;
		void year;
		void month;
		fetchAll();
	});

	onMount(() => fetchAll());

	// ---- カテゴリー選択 → 別ルートへ遷移 ----
	function openCategory(cat: CategoryBreakdown) {
		const p = new SvelteURLSearchParams({ mode, type: txType, name: cat.name, color: cat.color });
		if (mode === 'month') {
			p.set('year', String(year));
			p.set('month', String(month));
		} else if (mode === 'year') {
			p.set('year', String(year));
		}
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`/report/category/${cat.categoryId}?${p}`);
	}

	// ---- モード変更 ----
	function setMode(m: Mode) {
		mode = m;
	}
	function setTxType(t: TxType) {
		txType = t;
	}

	// ---- ナビゲーション ----
	function prevPeriod() {
		if (mode === 'month') {
			if (month === 1) {
				month = 12;
				year -= 1;
			} else {
				month -= 1;
			}
		} else if (mode === 'year') {
			year -= 1;
		}
	}

	function nextPeriod() {
		if (mode === 'month') {
			if (month === 12) {
				month = 1;
				year += 1;
			} else {
				month += 1;
			}
		} else if (mode === 'year') {
			year += 1;
		}
	}

	// ---- ラベル ----
	const periodLabel = $derived(
		mode === 'month' ? `${year}年${month}月` : mode === 'year' ? `${year}年` : '全期間'
	);

	// ---- Chart.js 用データ ----
	const barLabels = $derived(reportData?.timeSeries.map((d) => d.label) ?? []);
	const barValues = $derived(reportData?.timeSeries.map((d) => d.amount) ?? []);
	const donutLabels = $derived(reportData?.categoryBreakdown.map((d) => d.name) ?? []);
	const donutValues = $derived(reportData?.categoryBreakdown.map((d) => d.amount) ?? []);
	const donutColors = $derived(reportData?.categoryBreakdown.map((d) => d.color) ?? []);

	const barColor = $derived(txType === 'expense' ? '#ef4444' : '#3b82f6');

	// ---- 合計金額フォーマット ----
	const totalFormatted = $derived(
		reportData ? '¥' + new Intl.NumberFormat('ja-JP').format(reportData.total) : '¥0'
	);
</script>

<svelte:head>
	<title>レポート | 家計簿</title>
</svelte:head>

<PageHeader title="レポート" />

<div class="report-page">
	<!-- スティッキーヘッダー（期間タブ + ナビゲーター） -->
	<div class="sticky-header">
		<div class="tab-row">
			<button class="tab-btn" class:active={mode === 'month'} onclick={() => setMode('month')}
				>月別</button
			>
			<button class="tab-btn" class:active={mode === 'year'} onclick={() => setMode('year')}
				>年間</button
			>
			<button class="tab-btn" class:active={mode === 'all'} onclick={() => setMode('all')}
				>全期間</button
			>
		</div>

		{#if mode !== 'all'}
			<div class="navigator">
				<button class="nav-btn" onclick={prevPeriod} aria-label="前の期間">
					<ChevronLeft size={20} />
				</button>
				<span class="period-label">{periodLabel}</span>
				<button class="nav-btn" onclick={nextPeriod} aria-label="次の期間">
					<ChevronRight size={20} />
				</button>
			</div>
		{:else}
			<div class="period-label-only">{periodLabel}</div>
		{/if}
	</div>

	<!-- コンテンツ -->
	{#if loading}
		<div class="loading">読み込み中…</div>
	{:else if !reportData || reportData.total === 0}
		<div class="empty">
			<p class="empty-text">データがありません</p>
		</div>
	{:else}
		<!-- 収支サマリー -->
		<div class="summary-wrapper">
			<MonthSummary income={incomeTotal} expense={expenseTotal} />
		</div>

		<!-- 支出/収入タブ -->
		<div class="type-tab-row">
			<button
				class="type-tab-btn"
				class:active-expense={txType === 'expense'}
				onclick={() => setTxType('expense')}>支出</button
			>
			<button
				class="type-tab-btn"
				class:active-income={txType === 'income'}
				onclick={() => setTxType('income')}>収入</button
			>
		</div>
		<!-- 棒グラフ（推移） -->
		<section class="chart-section">
			<h2 class="section-title">推移</h2>
			<ReportChart type="bar" labels={barLabels} values={barValues} {barColor} />
		</section>

		<!-- 円グラフ（カテゴリー別） -->
		<section class="chart-section donut-section">
			<h2 class="section-title">カテゴリー別</h2>
			<div class="donut-wrapper">
				<ReportChart
					type="doughnut"
					labels={donutLabels}
					values={donutValues}
					colors={donutColors}
				/>
				<!-- 中央合計 -->
				<div class="donut-center">
					<span class="donut-label">合計</span>
					<span class="donut-total">{totalFormatted}</span>
				</div>
			</div>
		</section>

		<!-- 内訳リスト -->
		<section class="breakdown-section">
			<h2 class="section-title">内訳</h2>
			<CategoryBreakdownList items={reportData.categoryBreakdown} onSelect={openCategory} />
		</section>
	{/if}
</div>

<style>
	.report-page {
		padding: 0 0 6rem;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.sticky-header {
		position: sticky;
		top: 3.5rem; /* PageHeader の高さ分オフセット */
		z-index: 10;
		background-color: var(--color-surface);
		padding: 0.5rem 1rem 0;
		border-bottom: 1px solid var(--color-border);
	}

	/* ---- 収支サマリーラッパー ---- */
	.summary-wrapper {
		padding: 0.875rem 1rem 0;
	}

	/* ---- 期間タブ ---- */
	.tab-row {
		display: flex;
		background-color: var(--color-surface-alt);
		border-radius: 0.75rem;
		padding: 0.25rem;
		gap: 0.25rem;
		margin-top: 0;
	}

	.tab-btn {
		flex: 1;
		padding: 0.5rem 0;
		border: none;
		border-radius: 0.5rem;
		background: transparent;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.tab-btn.active {
		background: var(--color-surface);
		color: var(--color-text);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
	}

	/* ---- ナビゲーター ---- */
	.navigator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 0.75rem 0;
	}

	.period-label-only {
		text-align: center;
		padding: 0.75rem 0;
		font-weight: 600;
		color: var(--color-text);
	}

	.period-label {
		font-weight: 600;
		font-size: 1rem;
		color: var(--color-text);
		min-width: 7rem;
		text-align: center;
	}

	.nav-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.375rem;
		border-radius: 0.5rem;
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
		transition: background 0.15s;
	}

	.nav-btn:hover {
		background: var(--color-surface-alt);
	}

	/* ---- 収支タブ ---- */
	.type-tab-row {
		display: flex;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1rem;
	}

	.type-tab-btn {
		flex: 1;
		padding: 0.625rem 0;
		border: none;
		border-bottom: 2px solid transparent;
		background: transparent;
		color: var(--color-text-muted);
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			color 0.15s,
			border-color 0.15s;
		margin-bottom: -1px;
	}

	.type-tab-btn.active-expense {
		color: var(--color-expense);
		border-bottom-color: var(--color-expense);
	}

	.type-tab-btn.active-income {
		color: var(--color-income);
		border-bottom-color: var(--color-income);
	}

	/* ---- グラフセクション ---- */
	.chart-section {
		margin-bottom: 1.5rem;
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.75rem;
	}

	/* 円グラフ：中央テキスト表示のため relative 配置 */
	.donut-section {
		position: relative;
	}

	.donut-wrapper {
		position: relative;
		max-width: 260px;
		margin: 0 auto;
	}

	.donut-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.donut-label {
		font-size: 0.7rem;
		color: var(--color-text-muted);
	}

	.donut-total {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text);
	}

	/* ---- 内訳リスト ---- */
	.breakdown-section {
		margin-bottom: 1.5rem;
	}

	/* ---- ローディング / 空 ---- */
	.loading,
	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4rem 1rem;
	}

	.empty-text {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}
</style>
