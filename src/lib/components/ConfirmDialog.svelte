<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		variant?: 'primary' | 'danger';
		onConfirm: () => void;
		onCancel: () => void;
	}

	const {
		open,
		title,
		message,
		confirmText = 'OK',
		cancelText = 'キャンセル',
		variant = 'primary',
		onConfirm,
		onCancel
	}: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onCancel();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="dialog-backdrop"
		transition:fade={{ duration: 150 }}
		onclick={onCancel}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="dialog-content"
			transition:scale={{ duration: 150, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
		>
			<h2 class="dialog-title">{title}</h2>
			<p class="dialog-message">{message}</p>

			<div class="dialog-actions">
				<button class="btn btn-cancel" onclick={onCancel}>{cancelText}</button>
				<button
					class="btn"
					class:btn-primary={variant === 'primary'}
					class:btn-danger={variant === 'danger'}
					onclick={onConfirm}
				>
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.dialog-content {
		background-color: var(--color-surface);
		border-radius: 1rem;
		padding: 1.5rem;
		width: 100%;
		max-width: 320px;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	.dialog-title {
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
		color: var(--color-text);
		font-family: 'Noto Sans JP', sans-serif;
	}

	.dialog-message {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: 1.5rem;
		line-height: 1.5;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		border: none;
		transition: opacity 0.2s;
	}

	.btn:hover {
		opacity: 0.9;
	}

	.btn-cancel {
		background-color: var(--color-surface-alt);
		color: var(--color-text);
	}

	.btn-primary {
		background-color: var(--color-primary-500);
		color: white;
	}

	.btn-danger {
		background-color: var(--color-expense);
		color: white;
	}
</style>
