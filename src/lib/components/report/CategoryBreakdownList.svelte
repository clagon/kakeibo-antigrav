<script lang="ts">
	import LucideIcon from '$lib/components/LucideIcon.svelte';
	import { ChevronRight } from 'lucide-svelte';

	export interface CategoryBreakdown {
		categoryId: string;
		name: string;
		icon: string;
		color: string;
		amount: number;
		percent: number;
	}

	interface Props {
		items: CategoryBreakdown[];
		onSelect?: (item: CategoryBreakdown) => void;
	}

	let { items, onSelect }: Props = $props();

	// 金額フォーマット
	const fmt = new Intl.NumberFormat('ja-JP');
</script>

<ul class="breakdown-list">
	{#each items as item (item.categoryId)}
		<li class="breakdown-item">
			<button
				class="item-header"
				onclick={() => onSelect?.(item)}
				disabled={!onSelect}
				aria-label="{item.name}の詳細を表示"
			>
				<!-- アイコン -->
				<span class="icon-wrapper" style:background-color={item.color + '22'}>
					<LucideIcon name={item.icon} size={18} color={item.color} />
				</span>
				<!-- カテゴリー名 -->
				<span class="item-name">{item.name}</span>
				<!-- 割合 -->
				<span class="item-percent">{item.percent}%</span>
				<!-- 金額 -->
				<span class="item-amount">¥{fmt.format(item.amount)}</span>
				<!-- 矢印（onSelect があるときだけ） -->
				{#if onSelect}
					<span class="chevron"><ChevronRight size={16} /></span>
				{/if}
			</button>
			<!-- カラーバー -->
			<div class="bar-track">
				<div
					class="bar-fill"
					style:width="{item.percent}%"
					style:background-color={item.color}
				></div>
			</div>
		</li>
	{/each}
</ul>

<style>
	.breakdown-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.breakdown-item {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.item-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: none;
		padding: 0;
		width: 100%;
		cursor: pointer;
		text-align: left;
	}

	.item-header:disabled {
		cursor: default;
	}

	.item-header:not(:disabled):active {
		opacity: 0.7;
	}

	.icon-wrapper {
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.item-name {
		flex: 1;
		font-size: 0.875rem;
		color: var(--color-text);
	}

	.item-percent {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		width: 3rem;
		text-align: right;
	}

	.item-amount {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text);
		width: 6rem;
		text-align: right;
	}

	.chevron {
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
	}

	.bar-track {
		height: 4px;
		background-color: var(--color-border);
		border-radius: 9999px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		border-radius: 9999px;
		transition: width 0.4s ease;
	}
</style>
