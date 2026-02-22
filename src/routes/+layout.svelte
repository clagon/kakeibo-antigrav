<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { children } = $props();

	onMount(() => {
		if (browser && 'serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/service-worker.js', {
					type: 'module'
				})
				.catch((err) => {
					console.error('ServiceWorker registration failed: ', err);
				});
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="app-layout">
	<main class="main-content">
		{@render children()}
	</main>
	<BottomNav />
</div>
<Toast />

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
