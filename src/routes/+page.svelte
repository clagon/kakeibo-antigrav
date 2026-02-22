<script lang="ts">
	import { ChevronLeft, ChevronRight, Plus } from 'lucide-svelte';
	import LineItemDrawer from '$lib/components/LineItemDrawer.svelte';
	import LineItemList from '$lib/components/LineItemList.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import { formatCurrency } from '$lib/utils/format';
	import { showToast } from '$lib/stores/toast';
	import { page } from '$app/stores';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';

	/** 明細ドラフト型 */
	interface LineItemDraft {
		id: string;
		categoryId: string;
		categoryName: string;
		categoryIcon: string;
		categoryColor: string;
		memo: string;
		amount: number;
	}

	/** カテゴリー型 */
	interface Category {
		id: string;
		name: string;
		icon: string;
		color: string;
	}

	/* ステート */
	let activeTab: 'expense' | 'income' = $state('expense');
	let date: string = $state(todayString());
	let memo: string = $state('');
	let lineItems: LineItemDraft[] = $state([]);
	let isDrawerOpen: boolean = $state(false);
	let categories: Category[] = $state([]);
	let isSaving: boolean = $state(false);
	let nextItemId = 0;

	// 編集・削除用ステート
	let editingReceiptId: string | null = $state(null);
	let isConfirmOpen: boolean = $state(false);
	let isDeleting: boolean = $state(false);

	/** 今日の日付文字列を返す */
	function todayString(): string {
		return new Date().toISOString().split('T')[0];
	}

	/** 日付を1日変更 */
	function shiftDate(days: number) {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- 計算用の一時Date。状態としてはstring(date)を使用
		const d = new Date(date);
		d.setDate(d.getDate() + days);
		date = d.toISOString().split('T')[0];
	}

	/** 合計金額 */
	const total = $derived(lineItems.reduce((sum, item) => sum + item.amount, 0));

	/** タブ切り替え時にカテゴリーを再取得 */
	async function fetchCategories(type: 'expense' | 'income') {
		const res = await fetch(`/api/categories?type=${type}`);
		if (res.ok) {
			categories = await res.json();
		}
	}

	/** タブ変更 */
	function switchTab(tab: 'expense' | 'income') {
		activeTab = tab;
		lineItems = [];
		fetchCategories(tab);
	}

	/** 初期読み込み */
	$effect(() => {
		fetchCategories(activeTab);

		// クエリから日付を受け取る処理
		const queryDate = $page.url.searchParams.get('date');
		if (queryDate && !isNaN(Date.parse(queryDate))) {
			date = queryDate;
		}

		// 編集モード：レシートIDがあれば取得する
		const editId = $page.url.searchParams.get('edit_receipt');
		if (editId && !editingReceiptId) {
			loadReceiptForEdit(editId);
		}
	});

	async function loadReceiptForEdit(id: string) {
		try {
			const res = await fetch(`/api/receipts/${id}`);
			if (res.ok) {
				const data = await res.json();
				editingReceiptId = data.id;
				date = data.date;
				activeTab = data.type;
				memo = data.memo;
				lineItems = data.items;
			} else {
				showToast('レシートの読み込みに失敗しました', 'error');
			}
		} catch {
			showToast('レシート読み込み中にエラーが発生しました', 'error');
		}
	}

	/** 明細追加 */
	function addLineItem(data: {
		categoryId: string;
		categoryName: string;
		categoryIcon: string;
		categoryColor: string;
		memo: string;
		amount: number;
	}) {
		lineItems = [...lineItems, { ...data, id: `draft-${nextItemId++}` }];
		isDrawerOpen = false;
	}

	/** 明細削除 */
	function removeLineItem(id: string) {
		lineItems = lineItems.filter((item) => item.id !== id);
	}

	/** レシート削除 */
	async function deleteReceipt() {
		if (!editingReceiptId) return;
		isDeleting = true;
		try {
			const res = await fetch(`/api/receipts/${editingReceiptId}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				showToast('削除しました');
				history.back(); // カレンダー等に戻る
			} else {
				showToast('削除に失敗しました', 'error');
			}
		} catch {
			showToast('削除に失敗しました', 'error');
		} finally {
			isDeleting = false;
			isConfirmOpen = false;
		}
	}

	/** 保存 */
	async function save() {
		if (lineItems.length === 0) return;
		isSaving = true;

		try {
			const method = editingReceiptId ? 'PUT' : 'POST';
			const url = editingReceiptId ? `/api/receipts/${editingReceiptId}` : '/api/receipts';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					date,
					type: activeTab,
					memo,
					items: lineItems.map((item) => ({
						categoryId: item.categoryId,
						memo: item.memo,
						amount: item.amount
					}))
				})
			});

			if (res.ok) {
				showToast('保存しました');
				if (editingReceiptId) {
					// 編集後は遷移元の画面に戻る
					history.back();
				} else {
					// 新規作成時は次の入力をしやすいようフォームリセット
					date = todayString();
					memo = '';
					lineItems = [];
				}
			} else {
				showToast('保存に失敗しました', 'error');
			}
		} catch {
			showToast('通信エラーが発生しました', 'error');
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>{activeTab === 'expense' ? '支出' : '収入'}入力 | 家計簿</title>
</svelte:head>

<PageHeader
	title={editingReceiptId ? '編集' : activeTab === 'expense' ? '支出入力' : '収入入力'}
	rightIcon={editingReceiptId ? 'Trash2' : undefined}
	onRightClick={editingReceiptId ? () => (isConfirmOpen = true) : undefined}
/>

<div class="input-page">
	<!-- タブ切り替え -->
	{#if !editingReceiptId}
		<div class="tabs">
			<button
				type="button"
				class="tab"
				class:active={activeTab === 'expense'}
				onclick={() => switchTab('expense')}
			>
				支出
			</button>
			<button
				type="button"
				class="tab"
				class:active={activeTab === 'income'}
				onclick={() => switchTab('income')}
			>
				収入
			</button>
		</div>
	{/if}

	<!-- 日付入力 -->
	<div class="date-picker">
		<button type="button" class="date-btn" onclick={() => shiftDate(-1)} aria-label="前日">
			<ChevronLeft size={20} />
		</button>
		<input type="date" class="date-input" bind:value={date} />
		<button type="button" class="date-btn" onclick={() => shiftDate(1)} aria-label="翌日">
			<ChevronRight size={20} />
		</button>
	</div>

	<!-- メモ入力 -->
	<div class="memo-section">
		<textarea class="memo-input" bind:value={memo} placeholder="メモ（任意）" rows="2"></textarea>
	</div>

	<!-- 合計 -->
	{#if lineItems.length > 0}
		<div class="total-section">
			<span class="total-label">合計</span>
			<span
				class="total-amount"
				class:expense={activeTab === 'expense'}
				class:income={activeTab === 'income'}
			>
				{formatCurrency(total)}
			</span>
		</div>
	{/if}

	<!-- 明細リスト -->
	<div class="items-section">
		<LineItemList items={lineItems} onremove={removeLineItem} />
	</div>

	<!-- 明細追加ボタン -->
	<button type="button" class="add-item-btn" onclick={() => (isDrawerOpen = true)}>
		<Plus size={20} />
		明細を追加
	</button>

	<!-- 保存ボタン -->
	<button
		type="button"
		class="save-btn"
		disabled={lineItems.length === 0 || isSaving}
		onclick={save}
	>
		{#if isSaving}
			保存中...
		{:else if editingReceiptId}
			上書きする
		{:else}
			保存する
		{/if}
	</button>
</div>

<!-- 明細追加ドロワー -->
<LineItemDrawer
	open={isDrawerOpen}
	{categories}
	onadd={addLineItem}
	onclose={() => (isDrawerOpen = false)}
/>

<!-- 削除確認ダイアログ -->
<ConfirmDialog
	open={isConfirmOpen}
	title="レシートの削除"
	message="このレシートと明細を完全に削除します。よろしいですか？"
	confirmText={isDeleting ? '削除中...' : '削除する'}
	variant="danger"
	onConfirm={deleteReceipt}
	onCancel={() => (isConfirmOpen = false)}
/>

<style>
	.input-page {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* タブ */
	.tabs {
		display: flex;
		background-color: var(--color-surface-alt);
		border-radius: 0.5rem;
		padding: 0.25rem;
	}

	.tab {
		flex: 1;
		padding: 0.5rem;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 0.15s,
			color 0.15s;
		background: transparent;
		color: var(--color-text-muted);
	}

	.tab.active {
		background-color: var(--color-surface);
		color: var(--color-text);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	/* 日付ピッカー */
	.date-picker {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.date-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		background: var(--color-surface);
		color: var(--color-text-muted);
		cursor: pointer;
		flex-shrink: 0;
	}

	.date-btn:active {
		background-color: var(--color-surface-alt);
	}

	.date-input {
		flex: 1;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		font-size: 0.9375rem;
		font-family: inherit;
		text-align: center;
		background: var(--color-surface);
	}

	/* メモ */
	.memo-section .memo-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-family: inherit;
		resize: none;
		background-color: var(--color-surface);
	}

	.memo-section .memo-input:focus {
		outline: 2px solid var(--color-primary-400);
		outline-offset: -1px;
	}

	/* 合計 */
	.total-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background-color: var(--color-surface-alt);
		border-radius: 0.5rem;
	}

	.total-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.total-amount {
		font-size: 1.25rem;
		font-weight: 700;
		font-family: 'Roboto', sans-serif;
	}

	.total-amount.expense {
		color: var(--color-expense);
	}

	.total-amount.income {
		color: var(--color-income);
	}

	/* 明細リスト */
	.items-section {
		min-height: 3rem;
	}

	/* 明細追加ボタン */
	.add-item-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		padding: 0.75rem;
		border: 2px dashed var(--color-border);
		border-radius: 0.5rem;
		background: none;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			border-color 0.15s,
			color 0.15s;
	}

	.add-item-btn:hover {
		border-color: var(--color-primary-400);
		color: var(--color-primary-500);
	}

	/* 保存ボタン */
	.save-btn {
		padding: 0.875rem;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		background-color: var(--color-primary-500);
		color: white;
		transition:
			background-color 0.15s,
			opacity 0.15s;
	}

	.save-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.save-btn:not(:disabled):active {
		background-color: var(--color-primary-600);
	}
</style>
