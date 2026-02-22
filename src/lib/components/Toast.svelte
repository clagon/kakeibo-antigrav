<script lang="ts">
	import { toasts } from '$lib/stores/toast';
</script>

{#if $toasts.length > 0}
	<div class="toast-container">
		{#each $toasts as msg (msg.id)}
			<div class="toast" class:success={msg.type === 'success'} class:error={msg.type === 'error'}>
				{msg.text}
			</div>
		{/each}
	</div>
{/if}

<style>
	/* トーストコンテナ */
	.toast-container {
		position: fixed;
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
		max-width: var(--spacing-app-max-width);
		padding: 0 1rem;
		pointer-events: none;
	}

	/* トースト個別 */
	.toast {
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		text-align: center;
		animation: toast-in 0.3s ease;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.toast.success {
		background-color: var(--color-balance);
		color: white;
	}

	.toast.error {
		background-color: var(--color-expense);
		color: white;
	}

	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateY(-0.5rem);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
