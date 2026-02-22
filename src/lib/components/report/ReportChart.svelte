<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Chart,
		DoughnutController,
		BarController,
		ArcElement,
		BarElement,
		CategoryScale,
		LinearScale,
		Tooltip,
		Legend
	} from 'chart.js';

	Chart.register(
		DoughnutController,
		BarController,
		ArcElement,
		BarElement,
		CategoryScale,
		LinearScale,
		Tooltip,
		Legend
	);

	interface Props {
		// グラフの種類
		type: 'doughnut' | 'bar';
		// ラベル配列
		labels: string[];
		// データ配列
		values: number[];
		// 色配列（doughnut用）
		colors?: string[];
		// バーの色（bar用）
		barColor?: string;
	}

	let { type, labels, values, colors = [], barColor = '#3b82f6' }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	// チャートのデータセットを構成
	function buildChartData() {
		if (type === 'doughnut') {
			return {
				labels,
				datasets: [
					{
						data: values,
						backgroundColor: colors,
						borderWidth: 2,
						borderColor: '#ffffff'
					}
				]
			};
		} else {
			return {
				labels,
				datasets: [
					{
						data: values,
						backgroundColor: barColor + 'cc',
						borderColor: barColor,
						borderWidth: 1,
						borderRadius: 4
					}
				]
			};
		}
	}

	// チャートのオプション
	function buildChartOptions() {
		const base = {
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				legend: { display: false },
				tooltip: {
					callbacks: {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						label: (ctx: any) => ` ¥${ctx.raw.toLocaleString('ja-JP')}`
					}
				}
			}
		};
		if (type === 'doughnut') {
			return { ...base, cutout: '65%' };
		}
		return {
			...base,
			scales: {
				x: { grid: { display: false } },
				y: {
					grid: { color: '#e2e8f0' },
					ticks: {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						callback: (v: any) => `¥${Number(v).toLocaleString('ja-JP')}`
					}
				}
			}
		};
	}

	onMount(() => {
		chart = new Chart(canvas, {
			type,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			data: buildChartData() as any,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			options: buildChartOptions() as any
		});
	});

	onDestroy(() => {
		chart?.destroy();
		chart = null;
	});

	// データが変わったらチャートを更新
	$effect(() => {
		if (!chart) return;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(chart.data as any) = buildChartData();
		chart.update();
	});
</script>

<div class="chart-wrapper">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.chart-wrapper {
		position: relative;
		width: 100%;
	}
</style>
