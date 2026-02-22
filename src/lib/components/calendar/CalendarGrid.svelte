<script lang="ts">
	import { formatCurrency } from '$lib/utils/format';
	import { goto } from '$app/navigation';
	import { longpress } from '$lib/utils/longpress';

	export interface DailyData {
		income: number;
		expense: number;
	}

	interface Props {
		year: number;
		month: number;
		dailyData: Record<string, DailyData>;
		onDayClick: (dateStr: string) => void;
	}

	const { year, month, dailyData = {}, onDayClick }: Props = $props();

	function handleLongPress(dateStr: string) {
		// 日付を長押しした場合の動作（入力画面への遷移）
		// 戻り先として年と月をクエリパラメータで渡す
		const [y, m] = dateStr.split('-');
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`/?date=${dateStr}&return_y=${y}&return_m=${parseInt(m)}`);
	}

	// 月曜始まり固定
	const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日'];

	// 今日の日付文字列
	const todayStr = new Date()
		.toLocaleDateString('ja-JP')
		.split('/')
		.map((s) => s.padStart(2, '0'))
		.join('-');

	// カレンダーの日付セル配列を生成
	interface DayCell {
		dateStr: string; // YYYY-MM-DD
		dayNum: number;
		isCurrentMonth: boolean;
		isToday: boolean;
		income: number;
		expense: number;
	}

	const calendarCells = $derived.by(() => {
		const cells: DayCell[] = [];
		// js Date: month is 0-indexed
		const firstDay = new Date(year, month - 1, 1);
		const lastDay = new Date(year, month, 0);

		const daysInMonth = lastDay.getDate();
		const firstDayOfWeek = firstDay.getDay(); // 0(Sun) - 6(Sat)

		// 月曜始まりのインデックスに変換 (月曜=0, ..., 日曜=6)
		const startDayIndex = (firstDayOfWeek + 6) % 7;

		// YYYY-MM-DD 文字列生成用ヘルパー
		const pad = (n: number) => n.toString().padStart(2, '0');

		// 前月分を埋める
		const prevLastDay = new Date(year, month - 1, 0).getDate();
		for (let i = startDayIndex - 1; i >= 0; i--) {
			const d = prevLastDay - i;
			const pM = month - 1 < 1 ? 12 : month - 1;
			const pY = month - 1 < 1 ? year - 1 : year;
			cells.push({
				dateStr: `${pY}-${pad(pM)}-${pad(d)}`,
				dayNum: d,
				isCurrentMonth: false,
				isToday: false,
				income: 0,
				expense: 0
			});
		}

		// 当月分
		for (let d = 1; d <= daysInMonth; d++) {
			const dateStr = `${year}-${pad(month)}-${pad(d)}`;
			const data = dailyData[dateStr] || { income: 0, expense: 0 };
			cells.push({
				dateStr,
				dayNum: d,
				isCurrentMonth: true,
				isToday: dateStr === todayStr,
				income: data.income,
				expense: data.expense
			});
		}

		// 来月分でグリッドの残りを埋める (6行=42セルに達するまで、または5行=35セルまで)
		const currentLength = cells.length;
		const totalCells = currentLength > 35 ? 42 : 35;
		let nextDay = 1;
		for (let i = currentLength; i < totalCells; i++) {
			const nM = month + 1 > 12 ? 1 : month + 1;
			const nY = month + 1 > 12 ? year + 1 : year;
			cells.push({
				dateStr: `${nY}-${pad(nM)}-${pad(nextDay)}`,
				dayNum: nextDay,
				isCurrentMonth: false,
				isToday: false,
				income: 0,
				expense: 0
			});
			nextDay++;
		}

		return cells;
	});
</script>

<div class="calendar">
	<!-- 曜日ヘッダー -->
	<div class="weekdays">
		{#each WEEKDAYS as wd (wd)}
			<div class="weekday">{wd}</div>
		{/each}
	</div>

	<!-- 日付グリッド -->
	<div class="days-grid">
		{#each calendarCells as cell (cell.dateStr)}
			<div
				class="day-cell"
				class:not-current={!cell.isCurrentMonth}
				class:today={cell.isToday}
				onclick={() => {
					if (cell.isCurrentMonth) onDayClick(cell.dateStr);
				}}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						if (cell.isCurrentMonth) onDayClick(cell.dateStr);
					}
				}}
				use:longpress={500}
				onlongpress={() => {
					if (cell.isCurrentMonth) handleLongPress(cell.dateStr);
				}}
				role="button"
				tabindex={cell.isCurrentMonth ? 0 : -1}
			>
				<div class="day-num" class:font-bold={cell.isToday}>{cell.dayNum}</div>
				<div class="amounts">
					<div class="amount-income">
						{cell.income > 0 ? `${formatCurrency(cell.income)}` : '\u00A0'}
					</div>
					<div class="amount-expense">
						{cell.expense > 0 ? `${formatCurrency(cell.expense)}` : '\u00A0'}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.calendar {
		background-color: var(--color-surface);
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		margin-bottom: 1rem;
	}

	.weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		background-color: var(--color-surface-alt);
		border-bottom: 1px solid var(--color-border);
	}

	.weekday {
		text-align: center;
		padding: 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-muted);
	}
	/* 土日の色付け */
	.weekday:nth-child(6) {
		color: var(--color-income); /* 土曜を青 */
	}
	.weekday:nth-child(7) {
		color: var(--color-expense); /* 日曜を赤 */
	}

	.days-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}

	.day-cell {
		min-height: 4.5rem;
		padding: 0.25rem;
		border-right: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		cursor: pointer;
		transition: background-color 0.1s;
	}

	.day-cell:nth-child(7n) {
		border-right: none;
	}

	.day-cell:hover {
		background-color: var(--color-surface-alt);
	}

	.day-cell.not-current {
		opacity: 0.3;
		cursor: default;
	}
	.day-cell.not-current:hover {
		background-color: transparent;
	}

	/* 今日の強調表示 */
	.day-cell.today {
		background-color: color-mix(in srgb, var(--color-balance) 10%, transparent);
	}

	.day-num {
		font-size: 0.875rem;
		text-align: center;
		margin-bottom: 0.25rem;
		font-variant-numeric: tabular-nums;
	}

	/* font-bold は Tailwind で適用されるが、確実に当てるため念の為カスタムでも */
	.day-num.font-bold {
		font-weight: 700;
	}

	.amounts {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		flex: 1;
		font-family: 'Roboto', sans-serif;
	}

	.amount-income,
	.amount-expense {
		font-size: 0.625rem;
		text-align: right;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-height: 0.875rem; /* 高さを固定 */
	}

	.amount-income {
		color: var(--color-income);
	}

	.amount-expense {
		color: var(--color-expense);
	}
</style>
