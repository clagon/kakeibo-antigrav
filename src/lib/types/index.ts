// 支出/収入の種別
export type TransactionType = 'expense' | 'income';

// カテゴリーデータ（フロントエンド用）
export interface CategoryData {
	id: string;
	name: string;
	icon: string;
	color: string;
	type: TransactionType;
	order: number;
}

// 明細データ（フロントエンド用）
export interface LineItemData {
	id: string;
	receiptId: string;
	categoryId: string;
	memo: string;
	amount: number;
}

// レシートデータ（フロントエンド用）
export interface ReceiptData {
	id: string;
	date: string;
	type: TransactionType;
	memo: string;
	items: LineItemData[];
}

// アプリ設定データ（フロントエンド用）
export interface AppSettingsData {
	initialBalance: number;
	weekStartDay: number;
}
