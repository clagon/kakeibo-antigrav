<script lang="ts">
	import LucideIcon from './LucideIcon.svelte';
	import { Trash2 } from 'lucide-svelte';
	import { formatCurrency } from '$lib/utils/format';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { userPreferences } from '$lib/stores/preferences';

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
		/** 明細編集時のコールバック */
		onedit?: (item: LineItemDraft) => void;
		/** 明細削除時のコールバック */
		onremove: (id: string) => void;
	}

	const { items, onedit, onremove }: Props = $props();

	function handleItemClick(item: LineItemDraft, e: Event) {
		// 削除ボタンがクリックされた場合は編集イベントを発火しない
		const target = e.target as HTMLElement;
		if (target.closest('.item-delete')) return;

		if (onedit) {
			onedit(item);
		}
	}
</script>

{#if items.length > 0}
	<ul class="line-item-list">
		{#each items as item (item.id)}
			<li
				class="line-item-container"
				transition:slide={{ duration: $userPreferences.enableAnimations ? 250 : 0 }}
				animate:flip={{ duration: $userPreferences.enableAnimations ? 250 : 0 }}
			>
				<div class="scroll-container">
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="line-item"
						class:clickable={!!onedit}
						onclick={(e) => handleItemClick(item, e)}
					>
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
					</div>
					<div class="item-actions">
						<button type="button" class="item-delete" onclick={() => onremove(item.id)}>
							<Trash2 size={20} />
						</button>
					</div>
				</div>
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

	/* 明細アイテムコンテナ (スワイプ用) */
	.line-item-container {
		border-radius: 0.75rem;
		overflow: hidden;
		position: relative;
	}

	.scroll-container {
		display: flex;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		-ms-overflow-style: none;
		height: 100%;
	}

	.scroll-container::-webkit-scrollbar {
		display: none;
	}

	/* 明細アイテム */
	.line-item {
		flex: 0 0 100%;
		scroll-snap-align: start;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background-color: var(--color-surface-alt);
		transition: background-color 0.15s;
		min-height: 3.5rem;
	}

	.line-item.clickable {
		cursor: pointer;
	}

	.line-item.clickable:hover {
		background-color: var(--color-surface-hover, #f1f5f9);
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

	/* アクション領域 */
	.item-actions {
		flex: 0 0 4.5rem;
		scroll-snap-align: end;
		display: flex;
		align-items: stretch;
		background-color: #ef4444; /* tailwind red-500 */
	}

	/* 削除ボタン */
	.item-delete {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		padding: 0;
		transition: opacity 0.15s;
	}

	.item-delete:hover {
		opacity: 1;
		color: var(--color-expense);
	}
</style>
