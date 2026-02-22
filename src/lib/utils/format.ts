/**
 * 金額を日本円形式でフォーマットする
 * @param amount - 金額（整数）
 * @returns フォーマット済み文字列（例: "¥1,234"）
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('ja-JP', {
		style: 'currency',
		currency: 'JPY',
		maximumFractionDigits: 0
	}).format(amount);
}

/**
 * 日付を日本語形式でフォーマットする
 * @param dateStr - ISO日付文字列（YYYY-MM-DD）
 * @returns フォーマット済み文字列（例: "2026年2月22日"）
 */
export function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	return new Intl.DateTimeFormat('ja-JP', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(date);
}

/**
 * 日付を短い形式でフォーマットする
 * @param dateStr - ISO日付文字列（YYYY-MM-DD）
 * @returns フォーマット済み文字列（例: "2/22"）
 */
export function formatDateShort(dateStr: string): string {
	const date = new Date(dateStr);
	return new Intl.DateTimeFormat('ja-JP', {
		month: 'numeric',
		day: 'numeric'
	}).format(date);
}
