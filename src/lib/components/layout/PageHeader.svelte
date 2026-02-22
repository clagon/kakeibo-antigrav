<script lang="ts">
	import LucideIcon from '$lib/components/LucideIcon.svelte';

	interface Props {
		title: string;
		rightIcon?: string;
		onRightClick?: () => void;
	}

	const { title, rightIcon, onRightClick }: Props = $props();
</script>

<header class="page-header">
	<h1 class="page-title">{title}</h1>
	{#if rightIcon && onRightClick}
		<button class="header-action" onclick={onRightClick} aria-label="Action">
			<LucideIcon name={rightIcon} size={20} color="var(--color-expense)" />
		</button>
	{/if}
</header>

<style>
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		background-color: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 10;
		height: 3.5rem;
	}

	.page-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
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
