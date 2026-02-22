<script lang="ts">
	import { onMount } from 'svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import { type AppSettingsData } from '$lib/types';
	import { goto } from '$app/navigation';
	import { ChevronRight } from 'lucide-svelte';

	// ---- 型定義 ----
	interface AppSettings extends AppSettingsData {
		id: string;
	}

	// ---- 状態 ----
	let settings = $state<AppSettings | null>(null);
	let isSavingSettings = $state(false);

	// ---- データ取得 ----
	async function fetchSettings() {
		const res = await fetch('/api/settings');
		settings = await res.json();
	}

	// ---- 設定保存（デバウンス） ----
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	function scheduleSave() {
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(async () => {
			if (!settings) return;
			isSavingSettings = true;
			await fetch('/api/settings', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					initialBalance: settings.initialBalance,
					weekStartDay: settings.weekStartDay
				})
			});
			isSavingSettings = false;
		}, 600);
	}

	onMount(fetchSettings);
</script>

<svelte:head>
	<title>その他 | 家計簿</title>
</svelte:head>

<PageHeader title="その他" />

<div class="settings-page">
	<!-- ① 全般設定 -->
	<section class="section">
		<h2 class="section-title">全般設定</h2>
		{#if settings}
			<!-- <div class="setting-row">
				<label class="setting-label" for="initial-balance">初期残高（円）</label>
				<input
					id="initial-balance"
					class="setting-input"
					type="number"
					step="1"
					min="0"
					bind:value={settings.initialBalance}
					oninput={scheduleSave}
				/>
			</div> -->

			<div class="setting-row">
				<label class="setting-label" for="week-start">週の開始日</label>
				<select
					id="week-start"
					class="setting-select"
					bind:value={settings.weekStartDay}
					onchange={scheduleSave}
				>
					<option value={1}>月曜始まり</option>
					<option value={0}>日曜始まり</option>
				</select>
			</div>

			{#if isSavingSettings}
				<p class="saving-hint">保存中…</p>
			{/if}
		{:else}
			<p class="loading-text">読み込み中…</p>
		{/if}
	</section>

	<!-- ② カスタマイズ -->
	<section class="section">
		<h2 class="section-title">カスタマイズ</h2>

		<button
			class="nav-row"
			onclick={() => {
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				goto('/settings/categories');
			}}
		>
			<span>カテゴリー設定</span>
			<ChevronRight size={18} />
		</button>
	</section>

	<!-- ③ ヘルプ / バージョン -->
	<section class="section">
		<h2 class="section-title">ヘルプ・情報</h2>

		<button
			class="nav-row"
			onclick={() => {
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				goto('/settings/terms');
			}}
		>
			<span>利用規約</span>
			<ChevronRight size={18} />
		</button>

		<button
			class="nav-row"
			onclick={() => {
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				goto('/settings/privacy');
			}}
		>
			<span>プライバシーポリシー</span>
			<ChevronRight size={18} />
		</button>

		<div class="version-row">
			<span class="version-label">バージョン</span>
			<span class="version-value">v{settings?.version || ''}</span>
		</div>
	</section>
</div>

<style>
	.settings-page {
		padding: 0 0 6rem;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	/* ---- セクション ---- */
	.section {
		padding: 1.25rem 1rem 0.75rem;
		border-bottom: 8px solid var(--color-surface-alt);
	}

	.section-title {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-muted);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin: 0 0 0.875rem;
	}

	/* ---- 全般設定 ---- */
	.setting-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0;
		border-bottom: 1px solid var(--color-border);
		gap: 1rem;
	}

	.setting-row:last-of-type {
		border-bottom: none;
	}

	.setting-label {
		font-size: 0.875rem;
		color: var(--color-text);
	}

	/* .setting-input {
		width: 7rem;
		text-align: right;
		padding: 0.375rem 0.5rem;
		border: 1.5px solid var(--color-border);
		border-radius: 0.5rem;
		background: var(--color-surface-alt);
		color: var(--color-text);
		font-size: 0.875rem;
	} */

	.setting-select {
		padding: 0.375rem 0.5rem;
		border: 1.5px solid var(--color-border);
		border-radius: 0.5rem;
		background: var(--color-surface-alt);
		color: var(--color-text);
		font-size: 0.875rem;
	}

	.saving-hint {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-align: right;
		margin: 0.25rem 0 0;
	}

	/* ---- ナビゲーション行 ---- */
	.nav-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.875rem 0;
		border: none;
		border-bottom: 1px solid var(--color-border);
		background: none;
		color: var(--color-text);
		font-size: 0.875rem;
		cursor: pointer;
		text-align: left;
	}

	.nav-row:last-of-type {
		border-bottom: none;
	}

	.version-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 0;
		border-top: 1px solid var(--color-border);
	}

	.version-label {
		font-size: 0.875rem;
		color: var(--color-text);
	}

	.version-value {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.loading-text {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		text-align: center;
		padding: 1rem;
	}
</style>
