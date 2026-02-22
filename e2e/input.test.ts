import { test, expect } from '@playwright/test';

test.describe('入力画面 (Phase 4)', () => {
    test('支出の明細を追加して保存できること', async ({ page }) => {
        // 入力画面にアクセス
        await page.goto('/');

        // タイトル確認
        await expect(page).toHaveTitle(/支出入力/);

        // 「明細を追加」ボタンをクリックしてドロワーを開く
        await page.getByRole('button', { name: '明細を追加' }).click();

        // ドロワーが開いたことを確認（「金額」という見出しがあるか）
        await expect(page.getByRole('heading', { name: '金額' })).toBeVisible();

        // カテゴリー「食費」を選択
        await page.getByRole('button', { name: '食費' }).click();

        // テンキーで「800」と入力
        await page.getByRole('button', { name: '8', exact: true }).click();
        await page.getByRole('button', { name: '0', exact: true }).click();
        await page.getByRole('button', { name: '0', exact: true }).click();

        // ドロワー要素を取得
        const drawer = page.getByRole('dialog', { name: '明細追加' });

        // メモを入力
        await drawer.getByPlaceholder('メモ（任意）').fill('ランチ');

        // ドロワー内の「追加」ボタンをクリック
        await drawer.getByRole('button', { name: '追加', exact: true }).click();

        // リストに明細（食費, ランチ, ¥800）が追加されていることを確認
        const itemsSection = page.locator('.items-section');
        await expect(itemsSection.getByText('食費')).toBeVisible();
        await expect(itemsSection.getByText('ランチ')).toBeVisible();
        await expect(itemsSection.getByText('¥800')).toBeVisible();

        // 合計金額が ¥800 になっていることを確認
        await expect(page.locator('.total-amount')).toHaveText('¥800');

        // 保存ボタンをクリック
        await page.getByRole('button', { name: '保存' }).click();

        // トースト「保存しました」が表示されることを確認
        await expect(page.getByText('保存しました')).toBeVisible();

        // 保存後、フォームがリセットされていることを確認（明細リストが空メッセージになるか）
        // 「明細がありません」というメッセージが表示されるのを待つ
        await expect(page.getByText('明細がありません')).toBeVisible();
    });
});
