<script lang="ts">
	import LucideIcon from './LucideIcon.svelte';

	interface Category {
		id: string;
		name: string;
		icon: string;
		color: string;
	}

	interface Props {
		/** カテゴリー一覧 */
		categories: Category[];
		/** 選択中のカテゴリーID */
		selectedId: string | null;
		/** カテゴリー選択時のコールバック */
		onselect: (category: Category) => void;
	}

	const { categories, selectedId, onselect }: Props = $props();
</script>

<div class="category-grid">
	{#each categories as cat (cat.id)}
		<button
			type="button"
			class="category-item"
			class:selected={selectedId === cat.id}
			onclick={() => onselect(cat)}
		>
			<div class="category-icon" style:color={cat.color}>
				<LucideIcon name={cat.icon} size={28} color={cat.color} />
			</div>
			<span class="category-label">{cat.name}</span>
		</button>
	{/each}
</div>

<style>
	/* カテゴリーグリッド */
	.category-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
	}

	/* カテゴリー項目 */
	.category-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem 0.25rem;
		border: 2px solid transparent;
		border-radius: 0.75rem;
		background: none;
		cursor: pointer;
		transition:
			border-color 0.15s,
			background-color 0.15s;
		-webkit-tap-highlight-color: transparent;
	}

	.category-item:active {
		background-color: var(--color-surface-alt);
	}

	.category-item.selected {
		border-color: var(--color-primary-400);
		background-color: var(--color-primary-50);
	}

	/* アイコン */
	.category-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
	}

	/* ラベル */
	.category-label {
		font-size: 0.6875rem;
		color: var(--color-text);
		text-align: center;
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}
</style>
