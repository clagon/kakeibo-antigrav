<script lang="ts">
	import LucideIcon from '$lib/components/LucideIcon.svelte';

	interface Props {
		title: string;
		leftIcon?: string;
		onLeftClick?: () => void;
		rightIcon?: string;
		onRightClick?: () => void;
	}

	const { title, leftIcon, onLeftClick, rightIcon, onRightClick }: Props = $props();
</script>

<header class="page-header">
	<div class="left-section">
		{#if leftIcon && onLeftClick}
			<button class="header-action" onclick={onLeftClick} aria-label="Back">
				<LucideIcon name={leftIcon} size={24} color="var(--color-text)" />
			</button>
		{/if}
	</div>
	<h1 class="page-title">{title}</h1>
	<div class="right-section">
		{#if rightIcon && onRightClick}
			<button class="header-action" onclick={onRightClick} aria-label="Action">
				<LucideIcon name={rightIcon} size={20} color="var(--color-expense)" />
			</button>
		{/if}
	</div>
</header>

<style>
	.page-header {
		display: flex;
		align-items: center;
		padding: 0 1.25rem;
		background-color: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 10;
		height: 3.5rem;
		gap: 0.75rem;
	}

	.left-section {
		display: flex;
		align-items: center;
	}

	.left-section:empty {
		display: none;
	}

	.right-section {
		display: flex;
		align-items: center;
		margin-left: auto;
	}

	.page-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header-action {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 50%;
		transition: background-color 0.15s;
		margin: -0.5rem; /* クリック領域を広げるためパディング分を相殺 */
	}

	.header-action:active {
		background-color: var(--color-surface-hover);
	}
</style>
