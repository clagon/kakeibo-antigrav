<script lang="ts">
	import { onMount } from 'svelte';
	import Sortable from 'sortablejs';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import CategoryRow from '$lib/components/settings/CategoryRow.svelte';
	import CategoryEditModal from '$lib/components/settings/CategoryEditModal.svelte';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { goto } from '$app/navigation';
	import { type CategoryData } from '$lib/types';

	// ---- 状態 ----
	let categories = $state<CategoryData[]>([]);
	let catTab = $state<'expense' | 'income'>('expense');
	let modalCat = $state<Partial<CategoryData> | null>(null);
	let confirmDelete = $state<CategoryData | null>(null);

	const filteredCats = $derived(
		categories.filter((c) => c.type === catTab).sort((a, b) => a.order - b.order)
	);

	// ---- SortableJS ----
	let sortableEl = $state<HTMLElement | null>(null);
	let sortableInstance: Sortable | null = null;

	function initSortable() {
		if (!sortableEl) return;
		sortableInstance?.destroy();
		sortableInstance = Sortable.create(sortableEl, {
			handle: '.drag-handle',
			animation: 150,
			onEnd: async () => {
				const ids = Array.from(sortableEl!.children).map((el) => (el as HTMLElement).dataset.id!);
				await Promise.all(
					ids.map((id, idx) =>
						fetch(`/api/categories/${id}`, {
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ order: idx })
						})
					)
				);
				ids.forEach((id, idx) => {
					const cat = categories.find((c) => c.id === id);
					if (cat) cat.order = idx;
				});
			}
		});
	}

	$effect(() => {
		void catTab;
		if (sortableEl) {
			setTimeout(() => initSortable(), 0);
		}
	});

	// ---- データ取得 ----
	async function fetchCategories() {
		const res = await fetch('/api/categories');
		categories = await res.json();
	}

	// ---- カテゴリー追加・編集 ----
	function openAdd() {
		modalCat = { name: '', icon: 'package', color: '#64748b', type: catTab };
	}

	function openEdit(cat: CategoryData) {
		modalCat = { ...cat };
	}

	async function handleModalSave(data: Partial<CategoryData>) {
		if (data.id) {
			const res = await fetch(`/api/categories/${data.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: data.name, icon: data.icon, color: data.color })
			});
			if (res.ok) {
				const updated: CategoryData = await res.json();
				const idx = categories.findIndex((c) => c.id === updated.id);
				if (idx >= 0) categories[idx] = updated;
			}
		} else {
			const res = await fetch('/api/categories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			});
			if (res.ok) {
				const added: CategoryData = await res.json();
				categories = [...categories, added];
			}
		}
		modalCat = null;
	}

	function requestDelete(cat: CategoryData) {
		confirmDelete = cat;
	}

	async function handleConfirmDelete() {
		if (!confirmDelete) return;
		const res = await fetch(`/api/categories/${confirmDelete.id}`, { method: 'DELETE' });
		if (res.status === 204) {
			categories = categories.filter((c) => c.id !== confirmDelete!.id);
		} else if (res.status === 409) {
			const body = await res.json();
			alert(body.error);
		}
		confirmDelete = null;
	}

	onMount(fetchCategories);
</script>

<svelte:head>
	<title>カテゴリー設定 | 家計簿</title>
</svelte:head>

<PageHeader
	title="カテゴリー設定"
	leftIcon="arrow-left"
	onLeftClick={() => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto('/settings');
	}}
/>

<div class="categories-page">
	<div class="tabs">
		<button class="tab" class:active={catTab === 'expense'} onclick={() => (catTab = 'expense')}
			>支出</button
		>
		<button class="tab" class:active={catTab === 'income'} onclick={() => (catTab = 'income')}
			>収入</button
		>
	</div>

	<div bind:this={sortableEl} class="cat-list">
		{#each filteredCats as cat (cat.id)}
			<div data-id={cat.id}>
				<CategoryRow category={cat} onEdit={openEdit} onDelete={requestDelete} />
			</div>
		{/each}
	</div>

	<button class="add-cat-btn" onclick={openAdd}> ＋ カテゴリーを追加 </button>
</div>

{#if modalCat}
	<CategoryEditModal
		category={modalCat}
		defaultType={catTab}
		onSave={handleModalSave}
		onClose={() => (modalCat = null)}
	/>
{/if}

{#if confirmDelete}
	<ConfirmDialog
		open={!!confirmDelete}
		title="カテゴリーを削除"
		message={`「${confirmDelete.name}」を削除しますか？\n使用中の明細がある場合はキャンセルされます。`}
		confirmText="削除"
		cancelText="キャンセル"
		variant="danger"
		onConfirm={handleConfirmDelete}
		onCancel={() => (confirmDelete = null)}
	/>
{/if}

<style>
	.categories-page {
		padding: 1rem;
	}

	.tabs {
		display: flex;
		background-color: var(--color-surface-alt);
		border-radius: 0.5rem;
		padding: 0.25rem;
		margin-bottom: 1rem;
	}

	.tab {
		flex: 1;
		padding: 0.5rem;
		border: none;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 0.15s,
			color 0.15s,
			box-shadow 0.15s;
		background: transparent;
		color: var(--color-text-muted);
	}

	.tab.active {
		background-color: var(--color-surface);
		color: var(--color-text);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.cat-list {
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		overflow: hidden;
		background: var(--color-surface);
	}

	.add-cat-btn {
		width: 100%;
		margin-top: 1rem;
		padding: 0.875rem;
		border: 1.5px dashed var(--color-border);
		border-radius: 0.75rem;
		background: none;
		color: var(--color-primary);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.13s;
	}

	.add-cat-btn:hover {
		background: var(--color-primary-bg);
	}
</style>
