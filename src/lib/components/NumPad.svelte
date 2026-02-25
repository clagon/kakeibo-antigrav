<script lang="ts">
	import { Delete } from 'lucide-svelte';

	interface Props {
		/** 現在の金額 */
		value?: number;
		/** 値変更時のコールバック */
		onchange: (value: number) => void;
	}

	const { value = 0, onchange }: Props = $props();

	/** 内部の文字列表現 */
	let display: string = $state('');

	$effect(() => {
		if (value === 0) {
			display = '';
		} else if (value > 0 && Number(display) !== value) {
			display = String(value);
		}
	});

	/** 数字キー押下 */
	function pressDigit(digit: string) {
		// 最大8桁に制限
		if (display.length >= 8) return;
		display = display + digit;
		onchange(Number(display) || 0);
	}

	/** 00キー押下 */
	function pressDoubleZero() {
		if (display.length === 0) return;
		if (display.length >= 7) return;
		display = display + '00';
		onchange(Number(display) || 0);
	}

	/** バックスペース */
	function pressBackspace() {
		display = display.slice(0, -1);
		onchange(Number(display) || 0);
	}

	/** クリア */
	function pressClear() {
		display = '';
		onchange(0);
	}
</script>

<div class="numpad">
	<!-- 金額表示 -->
	<div class="numpad-display">
		<span class="currency">¥</span>
		<span class="amount"
			>{display ? new Intl.NumberFormat('ja-JP').format(Number(display)) : '0'}</span
		>
	</div>

	<!-- テンキーグリッド -->
	<div class="numpad-grid">
		{#each ['7', '8', '9'] as d (d)}
			<button type="button" class="numpad-key" onclick={() => pressDigit(d)}>{d}</button>
		{/each}
		{#each ['4', '5', '6'] as d (d)}
			<button type="button" class="numpad-key" onclick={() => pressDigit(d)}>{d}</button>
		{/each}
		{#each ['1', '2', '3'] as d (d)}
			<button type="button" class="numpad-key" onclick={() => pressDigit(d)}>{d}</button>
		{/each}
		<button type="button" class="numpad-key" onclick={pressDoubleZero}>00</button>
		<button type="button" class="numpad-key" onclick={() => pressDigit('0')}>0</button>
		<button type="button" class="numpad-key action" onclick={pressBackspace}>
			<Delete size={20} />
		</button>
	</div>

	<!-- クリアボタン -->
	<button type="button" class="numpad-clear" onclick={pressClear}>クリア</button>
</div>

<style>
	.numpad {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* 金額表示 */
	.numpad-display {
		display: flex;
		align-items: baseline;
		justify-content: flex-end;
		padding: 0.5rem 1rem;
		background-color: var(--color-surface-alt);
		border-radius: 0.5rem;
		border: 1px solid var(--color-border);
	}

	.currency {
		font-size: 1rem;
		color: var(--color-text-muted);
		margin-right: 0.25rem;
	}

	.amount {
		font-size: 1.75rem;
		font-weight: 700;
		font-family: 'Roboto', sans-serif;
		letter-spacing: 0.02em;
	}

	/* テンキーグリッド */
	.numpad-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.375rem;
	}

	.numpad-key {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 2.75rem;
		font-size: 1.25rem;
		font-weight: 500;
		border: none;
		border-radius: 0.5rem;
		background-color: var(--color-surface-alt);
		color: var(--color-text);
		cursor: pointer;
		transition:
			background-color 0.1s,
			transform 0.1s;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	.numpad-key:active {
		background-color: var(--color-border);
		transform: scale(0.95);
	}

	.numpad-key.action {
		color: var(--color-text-muted);
	}

	/* クリアボタン */
	.numpad-clear {
		padding: 0.5rem;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		background: none;
		border: none;
		cursor: pointer;
		text-align: center;
	}

	.numpad-clear:hover {
		color: var(--color-expense);
	}
</style>
