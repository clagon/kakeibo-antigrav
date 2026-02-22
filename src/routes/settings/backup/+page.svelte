<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import { goto } from '$app/navigation';
	import { Upload, Download, FileText } from 'lucide-svelte';
	import { showToast } from '$lib/stores/toast';

	let fileInput: HTMLInputElement;
	let isImporting = $state(false);

	async function handleExport() {
		try {
			// GETで直接ファイルダウンロードを行うため href を変更
			window.location.href = '/api/export';
		} catch {
			showToast('エクスポートに失敗しました', 'error');
		}
	}

	async function handleImport(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith('.csv')) {
			showToast('CSVファイルを選択してください', 'error');
			target.value = '';
			return;
		}

		isImporting = true;
		const formData = new FormData();
		formData.append('file', file);

		try {
			const res = await fetch('/api/import', {
				method: 'POST',
				body: formData
			});

			const data = await res.json();
			if (res.ok) {
				showToast(data.message || 'インポートが完了しました', 'success');
			} else {
				showToast(data.error || 'インポートに失敗しました', 'error');
			}
		} catch {
			showToast('エラーが発生しました', 'error');
		} finally {
			isImporting = false;
			target.value = '';
		}
	}
</script>

<svelte:head>
	<title>データバックアップ（CSV） | 家計簿</title>
</svelte:head>

<PageHeader
	title="データ管理 (CSV)"
	leftIcon="arrow-left"
	onLeftClick={() => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto('/settings');
	}}
/>

<div class="backup-page">
	<div class="card">
		<div class="card-icon export-icon">
			<Download size={24} />
		</div>
		<div class="card-content">
			<h2 class="card-title">バックアップ（エクスポート）</h2>
			<p class="card-desc">現在保存されているすべての家計簿データをCSV形式でダウンロードします。</p>
			<button class="btn btn-primary" onclick={handleExport}> データをエクスポート </button>
		</div>
	</div>

	<div class="card">
		<div class="card-icon import-icon">
			<Upload size={24} />
		</div>
		<div class="card-content">
			<h2 class="card-title">復元（インポート）</h2>
			<p class="card-desc">
				バックアップしたCSVファイルをアップロードして、データを自動で復元します。
				<br /><small class="text-warn"
					>※重複チェックは行われないため、上書きや二重登録にご注意ください。</small
				>
			</p>
			<!-- 隠しファイル入力 -->
			<input
				type="file"
				accept=".csv"
				bind:this={fileInput}
				onchange={handleImport}
				style="display: none;"
			/>
			<button class="btn btn-secondary" onclick={() => fileInput.click()} disabled={isImporting}>
				{isImporting ? 'インポート実行中...' : 'ファイルを選択して復元'}
			</button>
		</div>
	</div>

	<div class="info-section">
		<h3><FileText size={18} /> CSVフォーマットについて</h3>
		<p class="format-desc">インポートする際は、以下の形式（1行目はヘッダー）に合わせてください。</p>
		<pre>
レシートID,日付,収支区分,レシートメモ,カテゴリー,金額,明細メモ
550e8400-e29b-41d4-a716-446655440000,2026-02-22,expense,スーパーでの買い物,食費,1500,ランチ
550e8400-e29b-41d4-a716-446655440000,2026-02-22,expense,スーパーでの買い物,食費,500,お茶
1,2026-12-26,income,,給与,300000,2月分
1,2026-12-26,income,賞与,500000,2月分
,2026-03-15,expense,食費,1500,ランチ</pre>
	</div>
</div>

<style>
	.backup-page {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding-bottom: 5rem;
	}

	.card {
		background: var(--color-surface);
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1rem;
	}

	.card-icon {
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.export-icon {
		background: linear-gradient(135deg, var(--color-primary-400), var(--color-primary-600));
	}

	.import-icon {
		background: linear-gradient(135deg, var(--color-expense), #e11d48);
	}

	.card-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
	}

	.card-title {
		font-size: 1.125rem;
		font-weight: 600;
	}

	.card-desc {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}

	.text-warn {
		color: var(--color-expense);
		opacity: 0.8;
	}

	.btn {
		width: 100%;
		padding: 0.875rem;
		border-radius: 0.75rem;
		font-weight: 600;
		font-size: 1rem;
		border: none;
		cursor: pointer;
		transition:
			transform 0.1s,
			opacity 0.2s;
	}

	.btn:active {
		transform: scale(0.98);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: var(--color-primary-500);
		color: white;
	}

	.btn-secondary {
		background-color: var(--color-surface-alt);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.info-section {
		padding: 1rem;
		background-color: var(--color-surface-alt);
		border-radius: 0.75rem;
	}

	.info-section h3 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: var(--color-text);
	}

	.format-desc {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-bottom: 0.5rem;
	}

	pre {
		background: var(--color-surface);
		padding: 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		overflow-x: auto;
		border: 1px solid var(--color-border);
		color: var(--color-text);
		line-height: 1.4;
	}
</style>
