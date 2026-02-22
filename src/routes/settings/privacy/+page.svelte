<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>プライバシーポリシー | 家計簿</title>
</svelte:head>

<PageHeader
	title="プライバシーポリシー"
	leftIcon="ChevronLeft"
	onLeftClick={() => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto('/settings');
	}}
/>

<article class="doc-page">
	<h1>プライバシーポリシー</h1>
	<p class="updated">最終更新: 2025年1月1日</p>

	<section>
		<h2>収集する情報</h2>
		<p>
			本アプリは、ユーザーが入力したレシート・明細・カテゴリーなどの家計データをデバイス内（またはセルフホストサーバー）のデータベースに保存します。
		</p>
	</section>

	<section>
		<h2>情報の利用目的</h2>
		<p>
			収集した情報は、収支の集計・グラフ表示など、本サービスの機能提供のためにのみ使用します。第三者への提供は行いません。
		</p>
	</section>

	<section>
		<h2>外部サービス</h2>
		<p>
			本アプリは Google Fonts を利用しています。Google
			のプライバシーポリシーが適用される場合があります。
		</p>
	</section>

	<section>
		<h2>データの管理</h2>
		<p>
			すべてのデータはユーザー自身が管理するデータベースに保存されます。アプリを削除する際はデータベースも合わせて削除してください。
		</p>
	</section>

	<section>
		<h2>ポリシーの変更</h2>
		<p>
			本ポリシーは予告なく変更される場合があります。重要な変更がある場合はアプリ内でお知らせします。
		</p>
	</section>
</article>

<style>
	.doc-page {
		padding: 1.25rem 1.25rem 6rem;
		max-width: 600px;
		margin: 0 auto;
	}

	h1 {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 0.25rem;
	}

	.updated {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin: 0 0 1.5rem;
	}

	section {
		margin-bottom: 1.25rem;
	}

	h2 {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 0.375rem;
	}

	p {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		margin: 0;
	}
</style>
