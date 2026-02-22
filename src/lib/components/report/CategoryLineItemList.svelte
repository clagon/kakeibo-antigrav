<script lang="ts">
	import LucideIcon from '$lib/components/LucideIcon.svelte';
	import { formatCurrency } from '$lib/utils/format';
	import { SvelteSet } from 'svelte/reactivity';

	export interface CategoryLineItem {
		id: string;
		date: string; // YYYY-MM-DD
		receiptId: string;
		memo: string;
		amount: number;
		category: {
			id: string;
			name: string;
			icon: string;
			color: string;
		};
	}

	interface Props {
		items: CategoryLineItem[];
	}

	const { items }: Props = $props();

	// 曜日ラベル
	function weekDay(dateStr: string) {
		return ['日', '月', '火', '水', '木', '金', '土'][new Date(dateStr).getDay()];
	}

	// 日付ごとにグルーピング
	interface DayGroup {
		dateStr: string;
		displayDate: string;
		total: number;
		items: CategoryLineItem[];
	}

	const grouped = $derived.by(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const map = new Map<string, DayGroup>();
		for (const item of items) {
			if (!map.has(item.date)) {
				const [, m, d] = item.date.split('-');
				map.set(item.date, {
					dateStr: item.date,
					displayDate: `${parseInt(m)}月${parseInt(d)}日（${weekDay(item.date)}）`,
					total: 0,
					items: []
				});
			}
			const g = map.get(item.date)!;
			g.items.push(item);
			g.total += item.amount;
		}
		return Array.from(map.values()).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
	});

	/** 複数月をまたぐ場合に年月ヘッダーを挿入するための Set */
	const monthHeaderDates = $derived.by(() => {
		const yearMonths = new SvelteSet(grouped.map((g) => g.dateStr.slice(0, 7)));
		if (yearMonths.size <= 1) return new SvelteSet<string>();

		const result = new SvelteSet<string>();
		let prev = '';
		for (const g of grouped) {
			const ym = g.dateStr.slice(0, 7);
			if (ym !== prev) {
				result.add(g.dateStr);
				prev = ym;
			}
		}
		return result;
	});

	/** YYYY-MM → "YYYY年M月" 表示 */
	function monthLabel(dateStr: string) {
		const [y, m] = dateStr.split('-');
		return `${y}年${parseInt(m)}月`;
	}
</script>

<div class="line-item-list">
	{#each grouped as group (group.dateStr)}
		<!-- 年月ヘッダー（複数月の場合のみ） -->
		{#if monthHeaderDates.has(group.dateStr)}
			<div class="month-divider">
				<span>{monthLabel(group.dateStr)}</span>
			</div>
		{/if}

		<!-- 日別ヘッダー -->
		<div class="day-divider">
			<span class="day-label">{group.displayDate}</span>
			<span class="day-total">{formatCurrency(group.total)}</span>
		</div>

		<!-- 明細行 -->
		{#each group.items as item (item.id)}
			<div class="line-item">
				<span class="item-icon" style:background-color={item.category.color + '22'}>
					<LucideIcon name={item.category.icon} size={16} color={item.category.color} />
				</span>
				<span class="item-memo">{item.memo || item.category.name}</span>
				<span class="item-amount">{formatCurrency(item.amount)}</span>
			</div>
		{/each}
	{/each}
</div>

<style>
	.line-item-list {
		display: flex;
		flex-direction: column;
	}

	/* ---- 年月ヘッダー ---- */
	.month-divider {
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--color-text-muted);
		background: var(--color-surface-alt);
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
		letter-spacing: 0.03em;
	}

	/* ---- 日別ヘッダー ---- */
	.day-divider {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.4rem 1rem;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}

	.day-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.day-total {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text);
	}

	/* ---- 明細行 ---- */
	.line-item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 1rem;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}

	.item-icon {
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.375rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.item-memo {
		flex: 1;
		font-size: 0.875rem;
		color: var(--color-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-amount {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text);
		white-space: nowrap;
	}
</style>
