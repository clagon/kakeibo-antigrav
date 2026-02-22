<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
</script>

<svelte:head>
	<title>レポート | 家計簿</title>
</svelte:head>

<PageHeader title="レポート" />

<div class="page-container">
	<p class="page-placeholder">レポート画面（Phase 7で実装）</p>
</div>

<style>
	.page-container {
		padding: 1rem;
	}

	.page-placeholder {
		color: var(--color-text-muted);
		text-align: center;
		padding: 3rem 1rem;
	}
</style>
