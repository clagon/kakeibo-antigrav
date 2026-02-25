<script lang="ts">
	interface Props {
		/** 設定のID (forやid属性に使用) */
		id: string;
		/** 設定のタイトル */
		title: string;
		/** 設定の説明 */
		description?: string;
		/** 初期状態またはバインド用 */
		checked: boolean;
		/** チェック状態の変更時のコールバック */
		onchange: (checked: boolean) => void;
	}

	let { id, title, description = '', checked, onchange }: Props = $props();

	function handleChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		onchange(target.checked);
	}
</script>

<div class="setting-row toggle-row">
	<div class="setting-text">
		<label class="setting-label" for={id}>{title}</label>
		{#if description}
			<p class="setting-desc">{description}</p>
		{/if}
	</div>
	<label class="toggle-switch" for={id}>
		<input type="checkbox" {id} {checked} onchange={handleChange} />
		<div class="slider"></div>
	</label>
</div>

<style>
	/* setting-row base styles are handled by the parent container (+page.svelte) */
	/* but we must include the toggle-switch specific styles here */
	.setting-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-border);
		gap: 1rem;
	}

	.setting-row:last-child {
		border-bottom: none;
	}

	.setting-text {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.setting-label {
		font-size: 0.875rem;
		color: var(--color-text);
		display: flex;
		flex-direction: column;
		cursor: pointer;
	}

	.setting-desc {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin: 0.25rem 0 0 0;
	}

	/* Toggle Switch */
	.toggle-switch {
		position: relative;
		display: inline-block;
		width: 3rem;
		height: 1.75rem;
		flex-shrink: 0;
		cursor: pointer;
	}

	.toggle-switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--color-surface-hover);
		transition: 0.3s;
		border-radius: 1.75rem;
		border: 1px solid var(--color-border);
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 1.25rem;
		width: 1.25rem;
		left: 0.25rem;
		bottom: 0.1875rem;
		background-color: white;
		transition: 0.3s;
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	input:checked + .slider {
		background-color: var(--color-primary-500);
		border-color: var(--color-primary-500);
	}

	input:focus-visible + .slider {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	input:checked + .slider:before {
		transform: translateX(1.25rem);
	}
</style>
