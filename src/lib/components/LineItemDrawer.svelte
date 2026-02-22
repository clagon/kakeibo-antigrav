<script lang="ts">
	import CategoryGrid from './CategoryGrid.svelte';
	import NumPad from './NumPad.svelte';

	interface Category {
		id: string;
		name: string;
		icon: string;
		color: string;
	}

	interface Props {
		/** ドロワー表示フラグ */
		open: boolean;
		/** カテゴリー一覧 */
		categories: Category[];
		/** 明細追加時のコールバック */
		onadd: (data: {
			categoryId: string;
			categoryName: string;
			categoryIcon: string;
			categoryColor: string;
			memo: string;
			amount: number;
		}) => void;
		/** 閉じる時のコールバック */
		onclose: () => void;
	}

	const { open, categories, onadd, onclose }: Props = $props();

	/* フォームステート */
	let selectedCategory: Category | null = $state(null);
	let amount: number = $state(0);
	let memo: string = $state('');

	/** フォームリセット */
	function resetForm() {
		selectedCategory = null;
		amount = 0;
		memo = '';
	}

	/** 追加ボタン押下 */
	function handleAdd() {
		if (!selectedCategory || amount <= 0) return;
		onadd({
			categoryId: selectedCategory.id,
			categoryName: selectedCategory.name,
			categoryIcon: selectedCategory.icon,
			categoryColor: selectedCategory.color,
			memo,
			amount
		});
		resetForm();
	}

	/** 閉じるボタン押下 */
	function handleClose() {
		resetForm();
		onclose();
	}

	/** 追加可能か判定 */
	const canAdd = $derived(selectedCategory !== null && amount > 0);
</script>

{#if open}
	<!-- オーバーレイ -->
	<button type="button" class="overlay" onclick={handleClose} aria-label="閉じる"></button>

	<!-- ドロワー本体 -->
	<div class="drawer" role="dialog" aria-label="明細追加">
		<div class="drawer-handle"></div>

		<!-- カテゴリー選択 -->
		<section class="drawer-section">
			<h3 class="section-title">カテゴリー</h3>
			<CategoryGrid
				{categories}
				selectedId={selectedCategory?.id ?? null}
				onselect={(cat) => (selectedCategory = cat)}
			/>
		</section>

		<!-- 金額入力 -->
		<section class="drawer-section">
			<h3 class="section-title">金額</h3>
			<NumPad onchange={(v) => (amount = v)} />
		</section>

		<!-- メモ入力 -->
		<section class="drawer-section">
			<h3 class="section-title">メモ</h3>
			<textarea class="memo-input" bind:value={memo} placeholder="メモ（任意）" rows="2"></textarea>
		</section>

		<!-- アクションボタン -->
		<div class="drawer-actions">
			<button type="button" class="btn btn-cancel" onclick={handleClose}>キャンセル</button>
			<button type="button" class="btn btn-add" disabled={!canAdd} onclick={handleAdd}>追加</button>
		</div>
	</div>
{/if}

<style>
	/* オーバーレイ */
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		background-color: rgba(0, 0, 0, 0.4);
		border: none;
		cursor: default;
	}

	/* ドロワー */
	.drawer {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		z-index: 70;
		width: 100%;
		max-width: var(--spacing-app-max-width);
		max-height: 85dvh;
		overflow-y: auto;
		background-color: var(--color-surface);
		border-radius: 1rem 1rem 0 0;
		padding: 0.5rem 1rem 1.5rem;
		animation: slide-up 0.25s ease;
	}

	/* ドラッグハンドル */
	.drawer-handle {
		width: 2.5rem;
		height: 0.25rem;
		background-color: var(--color-border);
		border-radius: 0.125rem;
		margin: 0 auto 0.75rem;
	}

	/* セクション */
	.drawer-section {
		margin-bottom: 1rem;
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted);
		margin: 0 0 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* メモ入力 */
	.memo-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-family: inherit;
		resize: none;
		background-color: var(--color-surface-alt);
	}

	.memo-input:focus {
		outline: 2px solid var(--color-primary-400);
		outline-offset: -1px;
	}

	/* アクションボタン */
	.drawer-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.btn {
		flex: 1;
		padding: 0.75rem;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 0.15s,
			opacity 0.15s;
	}

	.btn-cancel {
		background-color: var(--color-surface-alt);
		color: var(--color-text-muted);
	}

	.btn-add {
		background-color: var(--color-primary-500);
		color: white;
	}

	.btn-add:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn-add:not(:disabled):active {
		background-color: var(--color-primary-600);
	}

	/* スライドアップアニメーション */
	@keyframes slide-up {
		from {
			transform: translateX(-50%) translateY(100%);
		}
		to {
			transform: translateX(-50%) translateY(0);
		}
	}
</style>
