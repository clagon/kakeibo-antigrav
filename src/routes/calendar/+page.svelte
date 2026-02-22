<script lang="ts">
	import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-svelte';
	import MonthSummary from '$lib/components/calendar/MonthSummary.svelte';
	import CalendarGrid from '$lib/components/calendar/CalendarGrid.svelte';
	import ReceiptAccordionList, {
		type ReceiptWithItems
	} from '$lib/components/calendar/ReceiptAccordionList.svelte';
	import MonthPickerModal from '$lib/components/calendar/MonthPickerModal.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	// 状態管理
	const today = new Date();
	let year = $state(today.getFullYear());
	let month = $state(today.getMonth() + 1);
	let isInitializing = $state(true);
	let receipts = $state<ReceiptWithItems[]>([]);
	let loading = $state(true);
	let showMonthPicker = $state(false);
	let stickyHeight = $state(0);

	// 初期表示時のクエリパラメータ反映
	$effect(() => {
		if (isInitializing) {
			const qYear = $page.url.searchParams.get('year');
			const qMonth = $page.url.searchParams.get('month');
			if (qYear) year = parseInt(qYear);
			if (qMonth) month = parseInt(qMonth);
			isInitializing = false;
		}
	});

	// データフェッチ
	$effect(() => {
		let isUnmounted = false;
		async function fetchMonthData() {
			loading = true;
			try {
				const res = await fetch(`/api/receipts/month?year=${year}&month=${month}`);
				if (res.ok) {
					const data = await res.json();
					if (!isUnmounted) receipts = data;
				}
			} catch (err) {
				console.error('Failed to fetch calendar data:', err);
			} finally {
				if (!isUnmounted) loading = false;
			}
		}
		fetchMonthData();

		return () => {
			isUnmounted = true;
		};
	});

	// 集計データ
	const monthSummary = $derived.by(() => {
		let income = 0;
		let expense = 0;
		for (const r of receipts) {
			const total = r.items.reduce((sum, item) => sum + item.amount, 0);
			if (r.type === 'income') income += total;
			else expense += total;
		}
		return { income, expense };
	});

	const dailyData = $derived.by(() => {
		const data: Record<string, { income: number; expense: number }> = {};
		for (const r of receipts) {
			if (!data[r.date]) data[r.date] = { income: 0, expense: 0 };
			const total = r.items.reduce((sum, item) => sum + item.amount, 0);
			if (r.type === 'income') data[r.date].income += total;
			else data[r.date].expense += total;
		}
		return data;
	});

	// アクション
	function prevMonth() {
		if (month === 1) {
			year -= 1;
			month = 12;
		} else {
			month -= 1;
		}
	}

	function nextMonth() {
		if (month === 12) {
			year += 1;
			month = 1;
		} else {
			month += 1;
		}
	}

	function handleDayClick(dateStr: string) {
		const targetEl = document.getElementById(`date-${dateStr}`);
		const stickyArea = document.querySelector('.sticky-area');
		if (targetEl && stickyArea) {
			const stickyHeight = stickyArea.clientHeight;
			// 該当要素のY座標にスクロール（sticky-areaの高さ + 余白16px 分を引く）
			const y = targetEl.getBoundingClientRect().top + window.scrollY - stickyHeight - 16;
			window.scrollTo({ top: y, behavior: 'smooth' });
		}
	}

	// タッチスワイプ検知
	let touchStartX = 0;
	let touchEndX = 0;

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].screenX;
		handleSwipe();
	}

	function handleSwipe() {
		const diff = touchEndX - touchStartX;
		// 50px以上のスワイプで月を切り替え
		if (diff > 50) prevMonth();
		else if (diff < -50) nextMonth();
	}
</script>

<svelte:head>
	<title>カレンダー | 家計簿</title>
</svelte:head>

<PageHeader
	title="カレンダー"
	rightIcon="search"
	onRightClick={() => {
		void goto('/search');
	}}
/>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="calendar-page"
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
	style="--sticky-header-height: {stickyHeight}px"
>
	<div class="sticky-area" bind:clientHeight={stickyHeight}>
		<header class="month-header">
			<button class="nav-button" onclick={prevMonth} aria-label="前月">
				<ChevronLeft size={24} />
			</button>
			<button class="month-title-btn" onclick={() => (showMonthPicker = true)}>
				<h1 class="month-title">{year}年 {month}月</h1>
				<ChevronDown size={20} class="month-title-icon" />
			</button>
			<button class="nav-button" onclick={nextMonth} aria-label="翌月">
				<ChevronRight size={24} />
			</button>
		</header>

		<div class="calendar-wrapper" class:loading>
			<CalendarGrid {year} {month} {dailyData} onDayClick={handleDayClick} />
		</div>
	</div>

	<div class="list-area">
		<MonthSummary income={monthSummary.income} expense={monthSummary.expense} />

		{#if loading}
			<div class="loading-state">読み込み中...</div>
		{:else if receipts.length === 0}
			<div class="empty-state">この月のデータはありません</div>
		{:else}
			<ReceiptAccordionList {receipts} />
		{/if}
	</div>
</div>

<MonthPickerModal
	open={showMonthPicker}
	{year}
	{month}
	onClose={() => (showMonthPicker = false)}
	onSelect={(y, m) => {
		year = y;
		month = m;
		showMonthPicker = false;
	}}
/>

<style>
	.calendar-page {
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.sticky-area {
		position: sticky;
		top: 3.5rem;
		z-index: 10;
		background-color: var(--color-surface);
		padding: 0.25rem 1rem 0;
	}

	.list-area {
		padding: 0 1rem 1rem;
		flex: 1;
	}

	.month-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0;
	}

	.month-title-btn {
		background: none;
		border: none;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		border-radius: 0.5rem;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-text);
	}

	.month-title-btn:hover {
		background-color: var(--color-surface-hover);
	}

	.month-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
		font-family: 'Roboto', sans-serif;
	}

	:global(.month-title-icon) {
		color: var(--color-text-muted);
	}

	.nav-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background-color: transparent;
		color: var(--color-text);
		cursor: pointer;
		transition: background-color 0.2s;
		border: none;
	}

	.nav-button:hover {
		background-color: var(--color-surface);
	}

	.calendar-wrapper {
		transition: opacity 0.2s;
	}
	.calendar-wrapper.loading {
		opacity: 0.5;
		pointer-events: none;
	}

	.loading-state,
	.empty-state {
		text-align: center;
		padding: 2rem;
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}
</style>
