<script lang="ts">
	import AnimatedNumber from '$lib/components/AnimatedNumber.svelte';

	interface Props {
		/** 収入合計 */
		income: number;
		/** 支出合計 */
		expense: number;
	}

	const { income, expense }: Props = $props();

	/** 収支バランス */
	const balance = $derived(income - expense);
</script>

<div class="summary-card">
	<div class="summary-item income">
		<span class="summary-label">収入</span>
		<span class="summary-amount income"><AnimatedNumber value={income} /></span>
	</div>
	<div class="summary-divider"></div>
	<div class="summary-item">
		<span class="summary-label">支出</span>
		<span class="summary-amount expense"><AnimatedNumber value={expense} /></span>
	</div>
	<div class="summary-divider"></div>
	<div class="summary-item">
		<span class="summary-label">収支</span>
		<span class="summary-amount balance" class:positive={balance >= 0} class:negative={balance < 0}>
			{balance > 0 ? '+' : ''}<AnimatedNumber value={Math.abs(balance)} />
		</span>
	</div>
</div>

<style>
	.summary-card {
		display: flex;
		align-items: stretch;
		background: var(--color-surface-alt);
		border-radius: 0.75rem;
		overflow: hidden;
	}

	.summary-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.75rem 0.5rem;
		gap: 0.2rem;
	}

	.summary-label {
		font-size: 0.7rem;
		color: var(--color-text-muted);
	}

	.summary-amount {
		font-size: 0.9rem;
		font-weight: 700;
		font-family: 'Roboto', sans-serif;
		color: var(--color-text);
	}

	.summary-amount.income {
		color: var(--color-income);
	}

	.summary-amount.expense {
		color: var(--color-expense);
	}

	.summary-amount.balance.positive {
		color: var(--color-balance);
	}

	.summary-amount.balance.negative {
		color: var(--color-expense);
	}

	.summary-divider {
		width: 1px;
		background: var(--color-border);
		margin: 0.5rem 0;
	}
</style>
