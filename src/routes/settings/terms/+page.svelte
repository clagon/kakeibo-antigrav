<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>利用規約 | 家計簿</title>
</svelte:head>

<PageHeader
	title="利用規約"
	leftIcon="ChevronLeft"
	onLeftClick={() => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto('/settings');
	}}
/>

<article class="doc-page">
	<h1>利用規約</h1>
	<p class="updated">最終更新: 2025年1月1日</p>

	<section>
		<h2>第1条（目的）</h2>
		<p>
			本規約は、本アプリ（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆様は本規約に同意のうえ、本サービスをご利用ください。
		</p>
	</section>

	<section>
		<h2>第2条（利用条件）</h2>
		<p>
			本サービスはスマートフォン向け家計簿アプリです。個人での非商業利用に限り、無償でご利用いただけます。
		</p>
	</section>

	<section>
		<h2>第3条（禁止事項）</h2>
		<p>以下の行為を禁止します。</p>
		<ul>
			<li>本サービスを商業目的に利用する行為</li>
			<li>本サービスのソースコードを無断で複製・頒布する行為</li>
			<li>本サービスの運営を妨害する行為</li>
		</ul>
	</section>

	<section>
		<h2>第4条（免責事項）</h2>
		<p>
			本サービスは現状有姿で提供され、いかなる保証も行いません。本サービスの利用に起因する損害について、開発者は一切の責任を負いません。
		</p>
	</section>

	<section>
		<h2>第5条（規約の変更）</h2>
		<p>
			本規約は予告なく変更される場合があります。変更後もご利用を継続された場合、改定後の規約に同意されたものとみなします。
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

	p,
	ul {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		margin: 0;
	}

	ul {
		padding-left: 1.25rem;
	}

	li {
		margin-bottom: 0.25rem;
	}
</style>
