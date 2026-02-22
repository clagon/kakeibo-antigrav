import { drizzle } from 'drizzle-orm/node-postgres';
import { categories, appSettings } from './schema';

// シードスクリプト: 初期カテゴリーとアプリ設定を投入
async function main() {
    const db = drizzle(process.env.DATABASE_URL!);

    console.log('🌱 シードデータを投入中...');

    // 支出カテゴリー
    const expenseCategories = [
        { name: '食費', icon: 'utensils', color: '#ef4444', type: 'expense' as const, order: 0 },
        { name: '交通費', icon: 'train-front', color: '#3b82f6', type: 'expense' as const, order: 1 },
        { name: '住居費', icon: 'house', color: '#8b5cf6', type: 'expense' as const, order: 2 },
        { name: '光熱費', icon: 'lightbulb', color: '#f59e0b', type: 'expense' as const, order: 3 },
        { name: '衣服', icon: 'shirt', color: '#ec4899', type: 'expense' as const, order: 4 },
        { name: '医療', icon: 'heart-pulse', color: '#10b981', type: 'expense' as const, order: 5 },
        { name: '通信費', icon: 'smartphone', color: '#06b6d4', type: 'expense' as const, order: 6 },
        { name: '娯楽', icon: 'gamepad-2', color: '#f97316', type: 'expense' as const, order: 7 },
        { name: '教育', icon: 'book-open', color: '#6366f1', type: 'expense' as const, order: 8 },
        { name: 'その他', icon: 'package', color: '#64748b', type: 'expense' as const, order: 9 }
    ];

    // 収入カテゴリー
    const incomeCategories = [
        { name: '給与', icon: 'wallet', color: '#3b82f6', type: 'income' as const, order: 0 },
        { name: '副収入', icon: 'trending-up', color: '#10b981', type: 'income' as const, order: 1 },
        { name: 'ボーナス', icon: 'gift', color: '#f59e0b', type: 'income' as const, order: 2 },
        { name: 'その他', icon: 'circle-plus', color: '#64748b', type: 'income' as const, order: 3 }
    ];

    // カテゴリーの挿入
    await db.insert(categories).values([...expenseCategories, ...incomeCategories]);
    console.log('✅ カテゴリーを投入しました');

    // アプリ設定の初期値
    await db.insert(appSettings).values({
        initialBalance: 0,
        weekStartDay: 1 // 月曜始まり
    });
    console.log('✅ アプリ設定を投入しました');

    console.log('🎉 シード完了！');
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ シードエラー:', err);
    process.exit(1);
});
