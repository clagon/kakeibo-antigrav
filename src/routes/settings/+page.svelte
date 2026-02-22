<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
</script>

<svelte:head>
	<title>その他 | 家計簿</title>
</svelte:head>

<PageHeader title="その他" />

<div class="page-container">
	<p class="page-placeholder">その他画面（Phase 8で実装）</p>
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
