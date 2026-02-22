<script lang="ts">
	import * as icons from 'lucide-svelte';
	import type { Component } from 'svelte';

	interface Props {
		/** lucide アイコン名（例: 'utensils', 'train-front'） */
		name: string;
		/** アイコンサイズ（px） */
		size?: number;
		/** アイコン色 */
		color?: string;
		/** ストローク幅 */
		strokeWidth?: number;
	}

	const { name, size = 24, color = 'currentColor', strokeWidth = 2 }: Props = $props();

	/**
	 * kebab-case のアイコン名を PascalCase に変換する
	 * 例: 'train-front' → 'TrainFront'
	 */
	function toPascalCase(str: string): string {
		return str
			.split('-')
			.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
			.join('');
	}

	/** アイコン名から対応するコンポーネントを取得 */
	const IconComponent: Component | undefined = $derived(
		(icons as unknown as Record<string, Component>)[toPascalCase(name)]
	);
</script>

{#if IconComponent}
	<IconComponent {size} {color} {strokeWidth} />
{/if}
