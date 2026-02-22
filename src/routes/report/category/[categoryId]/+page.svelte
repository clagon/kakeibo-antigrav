<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import ReportChart from '$lib/components/report/ReportChart.svelte';
	import CategoryLineItemList from '$lib/components/report/CategoryLineItemList.svelte';
	import type { CategoryLineItem } from '$lib/components/report/CategoryLineItemList.svelte';
	import { onMount } from 'svelte';

	// ---- URL パラメーター ----
	const categoryId = $derived($page.params.categoryId);
	const mode = $derived($page.url.searchParams.get('mode') ?? 'month');
	const txType = $derived($page.url.searchParams.get('type') ?? 'expense');
	const year = $derived($page.url.searchParams.get('year') ?? '');
	const month = $derived($page.url.searchParams.get('month') ?? '');
	const categoryName = $derived($page.url.searchParams.get('name') ?? 'カテゴリー');
	const categoryColor = $derived($page.url.searchParams.get('color') ?? '#64748b');

	// ---- 期間ラベル ----
	const periodLabel = $derived(
		mode === 'month' && year && month
			? `${year}年${month}月`
			: mode === 'year' && year
				? `${year}年`
				: '全期間'
	);

	// ---- 取得データ ----
	interface TimeSeriesItem {
		label: string;
		amount: number;
	}
	interface CategoryDetailData {
		timeSeries: TimeSeriesItem[];
		lineItems: CategoryLineItem[];
	}

	let detail = $state<CategoryDetailData | null>(null);
	let loading = $state(true);

	async function fetchDetail() {
		loading = true;
		detail = null;
		try {
			const params = new SvelteURLSearchParams({
				mode,
				type: txType,
				categoryId: String(categoryId)
			});
			if (mode === 'month' && year && month) {
				params.set('year', year);
				params.set('month', month);
			} else if (mode === 'year' && year) {
				params.set('year', year);
			}
			const res = await fetch(`/api/report/category?${params}`);
			if (res.ok) detail = await res.json();
		} finally {
			loading = false;
		}
	}

	function goBack() {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto('/report');
	}

	onMount(() => fetchDetail());

	// ---- チャート用データ ----
	const barLabels = $derived(detail?.timeSeries.map((d) => d.label) ?? []);
	const barValues = $derived(detail?.timeSeries.map((d) => d.amount) ?? []);
</script>

<svelte:head>
	<title>{categoryName} | レポート | 家計簿</title>
</svelte:head>

<PageHeader title={categoryName} leftIcon="ChevronLeft" onLeftClick={goBack}></PageHeader>

<div class="sub-page">
	<!-- 期間ラベル -->
	<div class="period-bar">{periodLabel}</div>

	{#if loading}
		<div class="loading">読み込み中…</div>
	{:else if detail}
		<!-- スティッキーなグラフ -->
		<div class="chart-sticky">
			<ReportChart type="bar" labels={barLabels} values={barValues} barColor={categoryColor} />
		</div>

		<!-- 明細一覧 -->
		{#if detail.lineItems.length === 0}
			<div class="empty"><p class="empty-text">明細がありません</p></div>
		{:else}
			<CategoryLineItemList items={detail.lineItems} />
		{/if}
	{/if}
</div>

<style>
	.sub-page {
		display: flex;
		flex-direction: column;
		padding-bottom: 6rem;
	}

	/* 期間ラベル */
	.period-bar {
		text-align: center;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		color: var(--color-text-muted);
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}

	/* グラフ sticky（PageHeader 3.5rem） */
	.chart-sticky {
		position: sticky;
		top: 3.5rem;
		z-index: 9;
		background: var(--color-surface);
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	/* ローディング / 空 */
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
