<script lang="ts">
	import LucideIcon from './LucideIcon.svelte';

	interface Category {
		id: string;
		name: string;
		icon: string;
		color: string;
	}

	interface Props {
		categories: Category[];
		onSelect: (category: Category) => void;
	}

	const { categories, onSelect }: Props = $props();
</script>

<div class="quick-categories" aria-label="よく使うカテゴリー">
	<span class="label">よく使う</span>
	<div class="list">
		{#each categories.slice(0, 4) as cat (cat.id)}
			<button
				type="button"
				class="quick-btn"
				onclick={() => onSelect(cat)}
				style="--cat-color: {cat.color}"
				aria-label="{cat.name}をクイック追加"
			>
				<span class="icon-wrap">
					<LucideIcon name={cat.icon} size={16} />
				</span>
				<span class="name">{cat.name}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.quick-categories {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		overflow-x: auto;
		padding: 0.25rem 0;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.quick-categories::-webkit-scrollbar {
		display: none;
	}

	.label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.list {
		display: flex;
		gap: 0.5rem;
	}

	.quick-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.2s;
	}

	.quick-btn:hover,
	.quick-btn:active {
		border-color: var(--cat-color);
		background-color: var(--color-surface-hover);
	}

	.icon-wrap {
		color: var(--cat-color);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.name {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text);
	}
</style>
