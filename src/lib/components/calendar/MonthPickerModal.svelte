<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { focusTrap } from '$lib/actions/focusTrap';

	// コンポーネントが受け取るプロパティの定義
	interface Props {
		open: boolean; // モーダルの表示状態
		year: number; // 初期表示に使用する年
		month: number; // 現在選択されている月
		onClose: () => void; // モーダルを閉じる際のコールバック
		onSelect: (year: number, month: number) => void; // 月が選択された際のコールバック
	}

	const props: Props = $props();

	// モーダル内で保持する「現在表示中の年」の状態
	let currentYear = $state(0);

	// モーダルが開かれた時に、一時的な表示年を props の年に同期する
	$effect(() => {
		if (props.open) {
			currentYear = props.year;
		}
	});

	// 月のボタンがクリックされた時の処理: 選択された月を親に伝える
	function handleMonthClick(m: number) {
		props.onSelect(currentYear, m);
	}

	// 前の年へ移動
	function handlePrevYear() {
		currentYear -= 1;
	}

	// 次の年へ移動
	function handleNextYear() {
		currentYear += 1;
	}

	// アクセシビリティ対応: Escapeキーでモーダルを閉じる
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') props.onClose();
	}

	// カレンダー描画用の月配列 [1, 2, ..., 12] を生成
	const months = Array.from({ length: 12 }, (_, i) => i + 1);
</script>

<svelte:window onkeydown={handleKeydown} />

{#if props.open}
	<!-- 背景のオーバーレイ (クリックすると閉じる) -->
	<div
		class="modal-backdrop"
		transition:fade={{ duration: 150 }}
		onclick={props.onClose}
		role="presentation"
	>
		<!-- モーダル本体 (クリックイベントの伝播を止めて閉じないようにする) -->
		<!-- svelte-ignore a11y_click_events_have_key_events  // stopPropagation()のみなのでbuttonとして扱わない -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="modal-content"
			transition:scale={{ duration: 150, start: 0.95 }}
			onclick={(e) => e.stopPropagation()}
			use:focusTrap
			role="document"
		>
			<!-- 年の切り替えヘッダー -->
			<div class="modal-header">
				<button class="year-btn" onclick={handlePrevYear}>◀</button>
				<span class="year-display">{currentYear}年</span>
				<button class="year-btn" onclick={handleNextYear}>▶</button>
			</div>

			<!-- 12ヶ月のグリッドボタン -->
			<div class="months-grid">
				{#each months as m (m)}
					<button
						class="month-btn"
						class:active={currentYear === props.year && m === props.month}
						onclick={() => handleMonthClick(m)}
					>
						{m}月
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 1rem;
	}

	.modal-content {
		background-color: var(--color-surface);
		border-radius: 1rem;
		padding: 1.5rem;
		width: 100%;
		max-width: 320px;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}

	.year-display {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.year-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		font-size: 1.25rem;
		color: var(--color-text-muted);
		cursor: pointer;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		transition: background-color 0.2s;
	}

	.year-btn:hover {
		background-color: var(--color-surface-hover);
		color: var(--color-text);
	}

	.months-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}

	.month-btn {
		background-color: var(--color-surface-alt);
		border: 1px solid transparent;
		padding: 0.75rem 0;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-text);
		cursor: pointer;
		transition: all 0.2s;
	}

	.month-btn:hover {
		background-color: var(--color-surface-hover);
	}

	.month-btn.active {
		background-color: var(--color-primary-500);
		color: #ffffff !important;
		font-weight: 700;
	}
</style>
