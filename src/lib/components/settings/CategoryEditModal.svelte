<script lang="ts">
	import LucideIcon from '$lib/components/LucideIcon.svelte';
	import { focusTrap } from '$lib/actions/focusTrap';
	import { type CategoryData } from '$lib/types';

	interface Props {
		/** null なら非表示 */
		category?: Partial<CategoryData> | null;
		/** 追加時に type を固定したい場合 */
		defaultType?: 'expense' | 'income';
		onSave: (data: Partial<CategoryData>) => void;
		onClose: () => void;
	}

	const { category = null, defaultType = 'expense', onSave, onClose }: Props = $props();

	// ---- フォーム状態 ----
	const isEdit = $derived(!!category?.id);
	let name = $state(category?.name ?? '');
	let selectedIcon = $state(category?.icon ?? 'package');
	let selectedColor = $state(category?.color ?? '#64748b');
	let selectedType = $state<'expense' | 'income'>(category?.type ?? defaultType);

	// ---- アイコン候補 ----
	const ICONS = [
		'utensils',
		'train-front',
		'house',
		'lightbulb',
		'shirt',
		'heart-pulse',
		'smartphone',
		'gamepad-2',
		'book-open',
		'package',
		'wallet',
		'trending-up',
		'gift',
		'circle-plus',
		'car',
		'plane',
		'bath',
		'baby',
		'paw-print',
		'music',
		'shopping-bag',
		'coffee',
		'beer',
		'dumbbell',
		'tv',
		'camera',
		'scissors',
		'wrench',
		'leaf',
		'sun'
	];

	// ---- カラープリセット ----
	const COLORS = [
		'#ef4444',
		'#f97316',
		'#f59e0b',
		'#eab308',
		'#84cc16',
		'#22c55e',
		'#10b981',
		'#14b8a6',
		'#06b6d4',
		'#0ea5e9',
		'#3b82f6',
		'#6366f1',
		'#8b5cf6',
		'#a855f7',
		'#ec4899',
		'#f43f5e',
		'#64748b',
		'#78716c',
		'#6b7280',
		'#374151'
	];

	function handleSubmit() {
		if (!name.trim()) return;
		onSave({
			id: category?.id,
			name: name.trim(),
			icon: selectedIcon,
			color: selectedColor,
			type: selectedType
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onClose();
	}
</script>

<!-- オーバーレイ -->
<div class="overlay" role="presentation" onclick={handleOverlayClick} onkeydown={handleKeydown}>
	<div
		class="modal"
		use:focusTrap
		role="dialog"
		aria-modal="true"
		aria-label={isEdit ? 'カテゴリーを編集' : 'カテゴリーを追加'}
	>
		<div class="modal-header">
			<h2 class="modal-title">{isEdit ? 'カテゴリーを編集' : 'カテゴリーを追加'}</h2>
			<button class="close-btn" onclick={onClose} aria-label="閉じる">✕</button>
		</div>

		<div class="modal-body">
			<!-- 種別（追加時のみ変更可） -->
			{#if !isEdit}
				<div class="field">
					<p class="field-label">種別</p>
					<div class="tabs">
						<button
							class="tab"
							class:active={selectedType === 'expense'}
							onclick={() => (selectedType = 'expense')}>支出</button
						>
						<button
							class="tab"
							class:active={selectedType === 'income'}
							onclick={() => (selectedType = 'income')}>収入</button
						>
					</div>
				</div>
			{/if}

			<!-- カテゴリー名 -->
			<div class="field">
				<label class="field-label" for="cat-name">カテゴリー名</label>
				<input
					id="cat-name"
					class="text-input"
					type="text"
					placeholder="例：食費"
					maxlength={20}
					bind:value={name}
				/>
			</div>

			<!-- アイコン選択 -->
			<div class="field">
				<p class="field-label">アイコン</p>
				<div class="icon-grid">
					{#each ICONS as icon (icon)}
						<button
							class="icon-btn"
							class:selected={selectedIcon === icon}
							style:background-color={selectedIcon === icon ? selectedColor + '33' : ''}
							onclick={() => (selectedIcon = icon)}
							aria-label={icon}
							aria-pressed={selectedIcon === icon}
						>
							<LucideIcon
								name={icon}
								size={20}
								color={selectedIcon === icon ? selectedColor : 'var(--color-text-muted)'}
							/>
						</button>
					{/each}
				</div>
			</div>

			<!-- カラー選択 -->
			<div class="field">
				<p class="field-label">カラー</p>
				<div class="color-grid">
					{#each COLORS as color (color)}
						<button
							class="color-btn"
							class:selected={selectedColor === color}
							style:background-color={color}
							onclick={() => (selectedColor = color)}
							aria-label={color}
							aria-pressed={selectedColor === color}
						>
							{#if selectedColor === color}
								<span class="color-check">✓</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- プレビュー -->
			<div class="preview">
				<div class="preview-icon" style:background-color={selectedColor + '22'}>
					<LucideIcon name={selectedIcon} size={24} color={selectedColor} />
				</div>
				<span class="preview-name">{name || 'カテゴリー名'}</span>
			</div>
		</div>

		<div class="modal-footer">
			<button class="btn-cancel" onclick={onClose}>キャンセル</button>
			<button class="btn-save" disabled={!name.trim()} onclick={handleSubmit}>
				{isEdit ? '保存' : '追加'}
			</button>
		</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		z-index: 100;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.modal {
		width: 100%;
		max-width: 480px;
		background: var(--color-surface);
		border-radius: 1.25rem 1.25rem 0 0;
		max-height: 90dvh;
		padding-bottom: env(safe-area-inset-bottom, 0);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* ヘッダー */
	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem 0.75rem;
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.modal-title {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1rem;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0.25rem 0.5rem;
	}

	/* ボディ */
	.modal-body {
		overflow-y: auto;
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	/* 種別トグル */

	.tabs {
		display: flex;
		background-color: var(--color-surface-alt);
		border-radius: 0.5rem;
		padding: 0.25rem;
		margin-bottom: 1rem;
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
			color 0.15s,
			box-shadow 0.15s;
		background: transparent;
		color: var(--color-text-muted);
	}

	.tab.active {
		background-color: var(--color-surface);
		color: var(--color-text);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	/* テキスト入力 */
	.text-input {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border: 1.5px solid var(--color-border);
		border-radius: 0.5rem;
		background: var(--color-surface-alt);
		color: var(--color-text);
		font-size: 0.9rem;
		box-sizing: border-box;
	}

	.text-input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	/* アイコングリッド */
	.icon-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 0.375rem;
	}

	.icon-btn {
		aspect-ratio: 1;
		border: 1.5px solid transparent;
		border-radius: 0.5rem;
		background: var(--color-surface-alt);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.12s;
	}

	.icon-btn.selected {
		border-color: var(--color-border);
	}

	/* カラーグリッド */
	.color-grid {
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		gap: 0.375rem;
	}

	.color-btn {
		aspect-ratio: 1;
		border: 2px solid transparent;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.12s;
	}

	.color-btn.selected {
		border-color: var(--color-text);
		transform: scale(1.1);
	}

	.color-check {
		color: #fff;
		font-size: 0.65rem;
		font-weight: 700;
		text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
	}

	/* プレビュー */
	.preview {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: var(--color-surface-alt);
		border-radius: 0.75rem;
	}

	.preview-icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.preview-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text);
	}

	/* フッター */
	.modal-footer {
		display: flex;
		gap: 0.75rem;
		padding: 0.875rem 1.25rem;
		border-top: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.btn-cancel {
		flex: 1;
		padding: 0.75rem;
		border: 1.5px solid var(--color-border);
		border-radius: 0.75rem;
		background: none;
		color: var(--color-text-muted);
		font-size: 0.9rem;
		cursor: pointer;
	}

	.btn-save {
		flex: 1;
		padding: 0.75rem;
		border: none;
		border-radius: 0.75rem;
		background: var(--color-primary-500);
		color: #fff;
		font-size: 0.9rem;
		font-weight: 700;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.btn-save:disabled {
		opacity: 0.4;
		cursor: default;
	}
</style>
