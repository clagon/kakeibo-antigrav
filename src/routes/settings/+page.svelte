<script lang="ts">
	import { Ellipsis } from 'lucide-svelte';
</script>

<svelte:head>
	<title>その他 | 家計簿</title>
</svelte:head>

<div class="page-container">
	<header class="page-header">
		<Ellipsis size={28} />
		<h1>その他</h1>
	</header>
	<p class="page-placeholder">その他画面（Phase 7で実装）</p>
</div>

<style>
	.page-container {
		padding: 1rem;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.page-header h1 {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
	}

	.page-placeholder {
		color: var(--color-text-muted);
		text-align: center;
		padding: 3rem 1rem;
	}
</style>
