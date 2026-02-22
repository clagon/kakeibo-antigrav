<script lang="ts">
	import LucideIcon from './LucideIcon.svelte';
	import { Trash2 } from 'lucide-svelte';
	import { formatCurrency } from '$lib/utils/format';

	interface LineItemDraft {
		id: string;
		categoryId: string;
		categoryName: string;
		categoryIcon: string;
		categoryColor: string;
		memo: string;
		amount: number;
	}

	interface Props {
		/** 明細リスト */
		items: LineItemDraft[];
		/** 明細削除時のコールバック */
		onremove: (id: string) => void;
	}

	const { items, onremove }: Props = $props();
</script>

{#if items.length > 0}
	<ul class="line-item-list">
		{#each items as item (item.id)}
			<li class="line-item">
				<div class="item-icon" style:color={item.categoryColor}>
					<LucideIcon name={item.categoryIcon} size={20} color={item.categoryColor} />
				</div>
				<div class="item-info">
					<span class="item-category">{item.categoryName}</span>
					{#if item.memo}
						<span class="item-memo">{item.memo}</span>
					{/if}
				</div>
				<span class="item-amount">{formatCurrency(item.amount)}</span>
				<button type="button" class="item-delete" onclick={() => onremove(item.id)}>
					<Trash2 size={16} />
				</button>
			</li>
		{/each}
	</ul>
{/if}

<style>
	/* 明細リスト */
	.line-item-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	/* 明細アイテム */
	.line-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background-color: var(--color-surface-alt);
		border-radius: 0.75rem;
		transition: background-color 0.15s;
		min-height: 3rem;
	}

	/* アイコン */
	.item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	/* 情報部分 */
	.item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.item-category {
		font-size: 0.8125rem;
		font-weight: 500;
	}

	.item-memo {
		font-size: 0.6875rem;
		color: var(--color-text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* 金額 */
	.item-amount {
		font-size: 0.875rem;
		font-weight: 600;
		font-family: 'Roboto', sans-serif;
		white-space: nowrap;
	}

	/* 削除ボタン */
	.item-delete {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		flex-shrink: 0;
		opacity: 0.5;
		transition: opacity 0.15s;
	}

	.item-delete:hover {
		opacity: 1;
		color: var(--color-expense);
	}
</style>
