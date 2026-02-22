<script lang="ts">
	import { formatCurrency } from '$lib/utils/format';

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

<div class="summary-container">
	<div class="summary-item">
		<span class="label text-income">収入</span>
		<span class="value text-income">{formatCurrency(income)}</span>
	</div>
	<div class="summary-divider"></div>
	<div class="summary-item">
		<span class="label text-expense">支出</span>
		<span class="value text-expense">{formatCurrency(expense)}</span>
	</div>
	<div class="summary-divider"></div>
	<div class="summary-item">
		<span class="label">収支</span>
		<span class="value" class:text-income={balance > 0} class:text-expense={balance < 0}>
			{balance > 0 ? '+' : ''}{formatCurrency(balance)}
		</span>
	</div>
</div>

<style>
	.summary-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--color-surface);
		padding: 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1rem;
	}

	.summary-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}

	.summary-divider {
		width: 1px;
		height: 2.5rem;
		background-color: var(--color-border);
	}

	.label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-muted);
		margin-bottom: 0.25rem;
	}

	.value {
		font-size: 1rem;
		font-weight: 700;
		font-family: 'Roboto', sans-serif;
	}

	.text-income {
		color: var(--color-income);
	}

	.text-expense {
		color: var(--color-expense);
	}
</style>
