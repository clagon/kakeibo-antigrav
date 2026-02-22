<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import ReceiptAccordionList, {
		type ReceiptWithItems
	} from '$lib/components/calendar/ReceiptAccordionList.svelte';
	import { Search } from 'lucide-svelte';
	import MonthSummary from '$lib/components/calendar/MonthSummary.svelte';

	let searchQuery = $state('');
	let receipts = $state<ReceiptWithItems[]>([]);
	let loading = $state(false);

	let debounceTimer: ReturnType<typeof setTimeout>;

	// 収支サマリー計算
	const summary = $derived.by(() => {
		let income = 0;
		let expense = 0;
		for (const r of receipts) {
			const total = r.items.reduce((sum, item) => sum + item.amount, 0);
			if (r.type === 'income') income += total;
			else expense += total;
		}
		return { income, expense, total: income - expense };
	});

	// 検索実行
	async function performSearch(query: string) {
		if (!query.trim()) {
			receipts = [];
			loading = false;
			return;
		}
		loading = true;
		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
			if (res.ok) {
				const data = await res.json();
				receipts = data;
			}
		} catch (err) {
			console.error('Search failed:', err);
		} finally {
			loading = false;
		}
	}

	// 入力変更ハンドラ（デバウンス付）
	function handleSearchInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const query = target.value;
		searchQuery = query;

		clearTimeout(debounceTimer);
		if (!query.trim()) {
			receipts = [];
			return;
		}
		debounceTimer = setTimeout(() => {
			performSearch(query);
		}, 400);
	}
</script>

<svelte:head>
	<title>検索 | 家計簿</title>
</svelte:head>

<PageHeader title="検索" leftIcon="chevron-left" onLeftClick={() => history.back()} />

<div class="search-page">
	<div class="sticky-header">
		<div class="search-bar">
			<Search class="search-icon" size={20} />
			<input
				type="text"
				placeholder="検索"
				value={searchQuery}
				oninput={handleSearchInput}
				class="search-input"
			/>
		</div>
		<MonthSummary income={summary.income} expense={summary.expense} />
	</div>

	<div class="result-area">
		{#if searchQuery.trim() === ''}
			<div class="placeholder-state">
				<Search size={48} class="placeholder-icon" />
				<p>検索</p>
			</div>
		{:else if loading}
			<div class="loading-state">検索中...</div>
		{:else if receipts.length === 0}
			<div class="empty-state">該当する記録が見つかりませんでした</div>
		{:else}
			<ReceiptAccordionList {receipts} />
		{/if}
	</div>
</div>

<style>
	.search-page {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.sticky-header {
		position: sticky;
		top: 3.5rem; /* PageHeader分 */
		background-color: var(--color-surface);
		z-index: 10;
		padding: 1rem;
		border-bottom: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.search-bar {
		position: relative;
		display: flex;
		align-items: center;
		background-color: var(--color-surface-alt);
		border-radius: var(--radius-md);
		padding: 0.5rem 1rem;
	}

	.search-input {
		flex: 1;
		background: none;
		border: none;
		font-size: 1rem;
		color: var(--color-text);
		outline: none;
		padding-left: 0.5rem;
	}

	.search-input::placeholder {
		color: var(--color-text-light);
	}

	.result-area {
		flex: 1;
		padding: 1rem;
		display: flex;
		flex-direction: column;
	}

	.placeholder-state,
	.loading-state,
	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: var(--color-text-light);
		gap: 1rem;
		padding: 3rem 1rem;
		text-align: center;
	}
</style>
