<script lang="ts">
	import CategoryGrid from './CategoryGrid.svelte';
	import NumPad from './NumPad.svelte';
	import { focusTrap } from '$lib/actions/focusTrap';
	import { userPreferences } from '$lib/stores/preferences';

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
		/** 編集対象の明細データ（nullの場合は新規追加） */
		editItem?: {
			categoryId: string;
			categoryName: string;
			categoryIcon: string;
			categoryColor: string;
			memo: string;
			amount: number;
		} | null;
		/** 初期選択するカテゴリー（Quick Add用） */
		initialCategory?: Category | null;
		/** 明細保存（追加・更新）時のコールバック */
		onsave: (
			data: {
				categoryId: string;
				categoryName: string;
				categoryIcon: string;
				categoryColor: string;
				memo: string;
				amount: number;
			},
			continuous: boolean
		) => void;
		/** 閉じる時のコールバック */
		onclose: () => void;
	}

	const {
		open,
		categories,
		editItem = null,
		initialCategory = null,
		onsave,
		onclose
	}: Props = $props();

	/* フォームステート */
	let selectedCategory: Category | null = $state(null);
	let amount: number = $state(0);
	let memo: string = $state('');
	let continuousInput: boolean = $state(false);
	let memoInput: HTMLTextAreaElement | undefined = $state();

	// クライアントサイドでのみローカルストレージから初期値を復元
	import { onMount } from 'svelte';
	onMount(() => {
		const stored = localStorage.getItem('kakeibo_continuous_input');
		if (stored) {
			continuousInput = stored === 'true';
		}
	});

	// 状態が変わるたびに保存
	$effect(() => {
		localStorage.setItem('kakeibo_continuous_input', String(continuousInput));
	});

	// open に応じたフォーム初期化
	$effect(() => {
		if (open) {
			if (editItem) {
				selectedCategory = {
					id: editItem.categoryId,
					name: editItem.categoryName,
					icon: editItem.categoryIcon,
					color: editItem.categoryColor
				};
				amount = editItem.amount;
				memo = editItem.memo;
			} else if (initialCategory) {
				selectedCategory = initialCategory;
				amount = 0;
				memo = '';
			} else {
				resetForm();
			}

			// オプションが有効ならメモ欄にフォーカスを当てる
			if ($userPreferences.autoFocusMemo) {
				setTimeout(() => {
					memoInput?.focus();
				}, 50); // アニメーションとfocusTrapの初期化を待機
			}
		}
	});

	/** フォームリセット */
	function resetForm() {
		selectedCategory = null;
		amount = 0;
		memo = '';
	}

	/** 保存ボタン押下 */
	function handleSave() {
		if (!selectedCategory || amount <= 0) return;
		onsave(
			{
				categoryId: selectedCategory.id,
				categoryName: selectedCategory.name,
				categoryIcon: selectedCategory.icon,
				categoryColor: selectedCategory.color,
				memo,
				amount
			},
			continuousInput && !isEdit
		);

		if (continuousInput && !isEdit) {
			amount = 0;
			memo = '';
			// selectedCategory は保持して連続入力をスムーズに
		} else {
			resetForm();
			// continuousInput の状態は保持する
		}
	}

	/** 閉じるボタン押下 */
	function handleClose() {
		resetForm();
		onclose();
	}

	/** 追加・更新可能か判定 */
	const canSave = $derived(selectedCategory !== null && amount > 0);
	const isEdit = $derived(!!editItem);
</script>

{#if open}
	<!-- オーバーレイ -->
	<button type="button" class="overlay" onclick={handleClose} aria-label="閉じる"></button>

	<!-- ドロワー本体 -->
	<div class="drawer" role="dialog" aria-modal="true" aria-label="明細追加" use:focusTrap>
		<div class="drawer-handle"></div>

		<!-- カテゴリー選択 -->
		<section class="drawer-section category-section">
			<h3 class="section-title sticky-title">カテゴリー</h3>
			<CategoryGrid
				{categories}
				selectedId={selectedCategory?.id ?? null}
				onselect={(cat) => (selectedCategory = cat)}
			/>
		</section>

		<!-- メモ入力 -->
		<section class="drawer-section">
			<h3 class="section-title">メモ</h3>
			<textarea
				bind:this={memoInput}
				class="memo-input"
				bind:value={memo}
				placeholder="メモ（任意）"
				rows="2"
			></textarea>
		</section>

		<!-- 金額入力 -->
		<section class="drawer-section">
			<h3 class="section-title">金額</h3>
			<NumPad value={amount} onchange={(v) => (amount = v)} />
		</section>

		<!-- アクションボタン -->
		<div class="drawer-actions-wrapper">
			{#if !isEdit}
				<div class="continuous-input-row">
					<label class="continuous-label">
						<input type="checkbox" bind:checked={continuousInput} />
						<span class="checkbox-text">続けて入力する</span>
					</label>
				</div>
			{/if}
			<div class="drawer-actions">
				<button type="button" class="btn btn-cancel" onclick={handleClose}>キャンセル</button>
				<button type="button" class="btn btn-save" disabled={!canSave} onclick={handleSave}>
					{isEdit ? '更新' : '追加'}
				</button>
			</div>
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
		max-height: 90dvh;
		display: flex;
		flex-direction: column;
		overflow-y: auto; /* Fallback for very short screens */
		background-color: var(--color-surface);
		border-radius: 1rem 1rem 0 0;
		padding: 0.25rem 0.75rem 1rem;
		animation: slide-up 0.25s ease;
	}

	/* ドラッグハンドル */
	.drawer-handle {
		width: 2.5rem;
		height: 0.25rem;
		background-color: var(--color-border);
		border-radius: 0.125rem;
		margin: 0.25rem auto 0.5rem;
		flex-shrink: 0;
	}

	/* セクション */
	.drawer-section {
		margin-bottom: 0.5rem;
		flex-shrink: 0;
	}

	.category-section {
		flex: 1;
		min-height: 6.5rem; /* Ensure at least one row of categories + padding is visible */
		overflow-y: auto;
		/* スクロールバーを見えにくくする対応 */
		scrollbar-width: none;
		-ms-overflow-style: none;
		margin-left: -0.75rem;
		margin-right: -0.75rem;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.category-section::-webkit-scrollbar {
		display: none;
	}

	.section-title {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-text-muted);
		margin: 0 0 0.375rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.sticky-title {
		position: sticky;
		top: 0;
		background-color: var(--color-surface);
		padding-top: 0.125rem;
		padding-bottom: 0.125rem;
		z-index: 2;
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
	.drawer-actions-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.continuous-input-row {
		display: flex;
		justify-content: flex-end;
		padding: 0 0.5rem;
	}

	.continuous-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-text);
		cursor: pointer;
	}

	.continuous-label input[type='checkbox'] {
		width: 1.125rem;
		height: 1.125rem;
		accent-color: var(--color-primary-500);
		cursor: pointer;
	}

	.drawer-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.btn {
		padding: 0.875rem;
		border-radius: 0.75rem;
		font-weight: 600;
		font-size: 1rem;
		border: none;
		cursor: pointer;
		transition:
			background-color 0.15s,
			opacity 0.15s;
	}

	.btn-cancel {
		background-color: var(--color-surface-alt);
		color: var(--color-text-muted);
	}

	.btn-save {
		background-color: var(--color-primary-500);
		color: white;
	}

	.btn-save:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn-save:not(:disabled):active {
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
