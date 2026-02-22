<script lang="ts">
	import LucideIcon from '$lib/components/LucideIcon.svelte';
	import { GripVertical, Pencil, Trash2 } from 'lucide-svelte';
	import { type CategoryData } from '$lib/types';

	interface Props {
		category: CategoryData;
		onEdit: (cat: CategoryData) => void;
		onDelete: (cat: CategoryData) => void;
	}

	const { category, onEdit, onDelete }: Props = $props();
</script>

<div class="category-row">
	<!-- ドラッグハンドル -->
	<span class="drag-handle" aria-hidden="true">
		<GripVertical size={18} />
	</span>

	<!-- アイコン -->
	<span class="cat-icon" style:background-color={category.color + '22'}>
		<LucideIcon name={category.icon} size={18} color={category.color} />
	</span>

	<!-- 名前 -->
	<span class="cat-name">{category.name}</span>

	<!-- アクション -->
	<div class="actions">
		<button class="action-btn edit" onclick={() => onEdit(category)} aria-label="編集">
			<Pencil size={16} />
		</button>
		<button class="action-btn delete" onclick={() => onDelete(category)} aria-label="削除">
			<Trash2 size={16} />
		</button>
	</div>
</div>

<style>
	.category-row {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 1rem;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}

	.drag-handle {
		color: var(--color-text-muted);
		cursor: grab;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.cat-icon {
		width: 2rem;
		height: 2rem;
		border-radius: 0.375rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.cat-name {
		flex: 1;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text);
	}

	.actions {
		display: flex;
		gap: 0.25rem;
	}

	.action-btn {
		width: 2rem;
		height: 2rem;
		border: none;
		border-radius: 0.5rem;
		background: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.13s;
	}

	.action-btn.edit {
		color: var(--color-text-muted);
	}

	.action-btn.edit:hover {
		background: var(--color-surface-alt);
	}

	.action-btn.delete {
		color: var(--color-expense);
	}

	.action-btn.delete:hover {
		background: #fee2e2;
	}
</style>
