import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatDateShort } from './format';

describe('formatCurrency', () => {
	it('正の金額をフォーマットできる', () => {
		expect(formatCurrency(1234)).toBe('￥1,234');
	});

	it('0をフォーマットできる', () => {
		expect(formatCurrency(0)).toBe('￥0');
	});

	it('大きな金額をフォーマットできる', () => {
		expect(formatCurrency(1000000)).toBe('￥1,000,000');
	});

	it('負の金額をフォーマットできる', () => {
		expect(formatCurrency(-500)).toBe('-￥500');
	});
});

describe('formatDate', () => {
	it('日付を日本語形式でフォーマットできる', () => {
		const result = formatDate('2026-02-22');
		expect(result).toContain('2026');
		expect(result).toContain('2');
		expect(result).toContain('22');
	});
});

describe('formatDateShort', () => {
	it('日付を短い形式でフォーマットできる', () => {
		const result = formatDateShort('2026-02-22');
		expect(result).toContain('2');
		expect(result).toContain('22');
	});
});
