<script lang="ts">
	import { formatCurrency } from '$lib/utils/format';
	import LucideIcon from '$lib/components/LucideIcon.svelte';
	import { longpress } from '$lib/utils/longpress';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';

	interface Category {
		id: string;
		name: string;
		icon: string;
		color: string;
		type: string;
	}

	interface LineItem {
		id: string;
		memo: string;
		amount: number;
		category: Category;
	}

	export interface ReceiptWithItems {
		id: string;
		date: string; // YYYY-MM-DD
		type: 'expense' | 'income';
		memo: string;
		items: LineItem[];
	}

	interface Props {
		receipts: ReceiptWithItems[];
	}

	const { receipts = [] }: Props = $props();

	// 排他制御のためのアクティブなレシートID
	let expandedReceiptId = $state<string | null>(null);

	// 日付ごとのグルーピングロジック
	interface GroupedDay {
		dateStr: string; // YYYY-MM-DD
		displayDate: string; // MM/DD (曜)
		income: number;
		expense: number;
		receipts: ReceiptWithItems[];
	}

	function getWeekDayOffset(dateStr: string) {
		const dt = new Date(dateStr);
		const days = ['日', '月', '火', '水', '木', '金', '土'];
		return days[dt.getDay()];
	}

	const groupedReceipts = $derived.by(() => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const groups = new Map<string, GroupedDay>();

		for (const r of receipts) {
			if (!groups.has(r.date)) {
				const [, month, day] = r.date.split('-');
				groups.set(r.date, {
					dateStr: r.date,
					displayDate: `${parseInt(month)}月${parseInt(day)}日（${getWeekDayOffset(r.date)}）`,
					income: 0,
					expense: 0,
					receipts: []
				});
			}

			const group = groups.get(r.date)!;
			group.receipts.push(r);

			// 合計の計算
			const totalAmount = r.items.reduce((sum, item) => sum + item.amount, 0);
			if (r.type === 'income') {
				group.income += totalAmount;
			} else {
				group.expense += totalAmount;
			}
		}

		// Map を配列に変換 (元のreceiptsが降順なので、概ねそのままでOKだが念の為ソートする)
		return Array.from(groups.values()).sort((a, b) => b.dateStr.localeCompare(a.dateStr));
	});

	function handleReceiptClick(id: string) {
		if (expandedReceiptId === id) {
			expandedReceiptId = null; // 既に開いていたら閉じる
		} else {
			expandedReceiptId = id; // 開く (他は自動で閉じる)
		}
	}

	function handleLongPress(receipt: ReceiptWithItems) {
		// 長押し時は編集モードとして入力画面へ
		// 戻り先として年と月をクエリパラメータで渡す
		const [y, m] = receipt.date.split('-');
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`/?edit_receipt=${receipt.id}&return_y=${y}&return_m=${parseInt(m)}`);
	}
</script>

<div class="receipt-list">
	{#each groupedReceipts as group (group.dateStr)}
		<!-- 日別ディバイダー -->
		<div class="day-divider" id="date-{group.dateStr}">
			<span class="day-label">{group.displayDate}</span>
			<div class="day-totals">
				{#if group.income > 0}
					<span class="text-income">+{formatCurrency(group.income)}</span>
				{/if}
				{#if group.expense > 0}
					<span class="text-expense">-{formatCurrency(group.expense)}</span>
				{/if}
			</div>
		</div>

		<!-- レシート一覧 -->
		{#each group.receipts as receipt (receipt.id)}
			{@const totalAmount = receipt.items.reduce((sum, item) => sum + item.amount, 0)}
			{@const isExpanded = expandedReceiptId === receipt.id}

			<div class="receipt-card-wrapper">
				<!-- レシートヘッダー行 (クリックで展開/長押しで編集) -->
				<button
					class="receipt-header"
					class:expanded={isExpanded}
					onclick={() => handleReceiptClick(receipt.id)}
					use:longpress={500}
					onlongpress={() => handleLongPress(receipt)}
					aria-expanded={isExpanded}
				>
					<div class="receipt-icon">
						<LucideIcon
							name={receipt.type === 'income' ? 'ArrowDownCircle' : 'ArrowUpCircle'}
							color={receipt.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)'}
							size={20}
						/>
					</div>
					<div class="receipt-memo">
						<span class="memo-text"
							>{receipt.memo || (receipt.type === 'income' ? '収入' : '支出')}</span
						>
						<span class="item-count">{receipt.items.length}件の明細</span>
					</div>
					<div
						class="receipt-amount"
						class:text-income={receipt.type === 'income'}
						class:text-expense={receipt.type === 'expense'}
					>
						{formatCurrency(totalAmount)}
					</div>
				</button>

				<!-- 明細アコーディオン (排他制御) -->
				{#if isExpanded}
					<div class="receipt-details" transition:slide={{ duration: 200 }}>
						{#each receipt.items as item (item.id)}
							<div class="line-item">
								<div class="category-info" style="color: {item.category.color}">
									<LucideIcon name={item.category.icon} size={16} color={item.category.color} />
									<span class="category-name">{item.category.name}</span>
								</div>
								<div class="item-memo">{item.memo}</div>
								<div class="item-amount">{formatCurrency(item.amount)}</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	{/each}
</div>

<style>
	.receipt-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-bottom: 2rem; /* スクロール余白 */
	}

	.day-divider {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.25rem;
		border-bottom: 1px solid var(--color-border);
		margin-top: 1rem;
		font-size: 0.875rem;
	}

	.day-label {
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.day-totals {
		display: flex;
		gap: 0.5rem;
		font-family: 'Roboto', sans-serif;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.text-income {
		color: var(--color-income);
	}
	.text-expense {
		color: var(--color-expense);
	}

	.receipt-card-wrapper {
		background-color: var(--color-surface);
		border-radius: 0.5rem;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		overflow: hidden;
	}

	.receipt-header {
		width: 100%;
		display: flex;
		align-items: center;
		padding: 1rem;
		gap: 1rem;
		background: none;
		border: none;
		cursor: pointer;
		transition: background-color 0.1s;
		text-align: left;
		/* フォーカス時にスティッキーヘッダーと下部ナビに隠れないようにマージンを設定 */
		scroll-margin-top: calc(3.5rem + var(--sticky-header-height, 0px) + 0.5rem);
		scroll-margin-bottom: 4.5rem;
	}

	.receipt-header:active {
		background-color: var(--color-surface-hover);
	}

	.receipt-header:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: -2px;
		background-color: var(--color-surface-hover);
		z-index: 1;
	}

	.receipt-header.expanded {
		background-color: var(--color-surface-alt);
		border-bottom: 1px dashed var(--color-border);
	}

	.receipt-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		background-color: var(--color-surface-alt);
		flex-shrink: 0;
	}

	.receipt-memo {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		overflow: hidden;
	}

	.memo-text {
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-count {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.receipt-amount {
		font-weight: 700;
		font-family: 'Roboto', sans-serif;
	}

	.receipt-details {
		padding: 0.5rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background-color: var(--color-surface-alt);
	}

	.line-item {
		display: flex;
		align-items: center;
		padding: 0.5rem 0;
		gap: 0.75rem;
	}

	.category-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		min-width: 6rem;
		flex-shrink: 0;
	}

	.category-name {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-memo {
		flex: 1;
		font-size: 0.875rem;
		color: var(--color-text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-amount {
		font-family: 'Roboto', sans-serif;
		font-weight: 500;
		font-size: 0.875rem;
		flex-shrink: 0;
	}
</style>
