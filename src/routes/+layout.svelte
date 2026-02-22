<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import BottomNav from '$lib/components/BottomNav.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="app-layout">
	<main class="main-content">
		{@render children()}
	</main>
	<BottomNav />
</div>

<style>
	/* アプリ全体レイアウト */
	.app-layout {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
	}

	/* メインコンテンツ（ナビ分のパディング確保 + PC幅制限） */
	.main-content {
		flex: 1;
		width: 100%;
		max-width: var(--spacing-app-max-width);
		margin: 0 auto;
		padding-bottom: var(--spacing-nav-height);
	}
</style>
