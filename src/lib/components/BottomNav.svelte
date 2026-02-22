<script lang="ts">
	import { page } from '$app/state';
	import { PencilLine, CalendarDays, ChartPie, Ellipsis } from 'lucide-svelte';

	/** ナビゲーション項目の定義 */
	const navItems = [
		{ href: '/', label: '入力', icon: PencilLine },
		{ href: '/calendar', label: 'カレンダー', icon: CalendarDays },
		{ href: '/report', label: 'レポート', icon: ChartPie },
		{ href: '/settings', label: 'その他', icon: Ellipsis }
	];

	/** 現在のパスがナビ項目と一致するか判定 */
	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- 静的パスのためresolve不要 -->
<nav class="bottom-nav" aria-label="メインナビゲーション">
	{#each navItems as item (item.href)}
		<a
			href={item.href}
			class="nav-item"
			class:active={isActive(item.href)}
			aria-current={isActive(item.href) ? 'page' : undefined}
		>
			<item.icon size={24} strokeWidth={isActive(item.href) ? 2.5 : 1.5} />
			<span class="nav-label">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	/* 下部ナビゲーション */
	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		z-index: 50;
		display: flex;
		justify-content: space-around;
		align-items: center;
		width: 100%;
		max-width: var(--spacing-app-max-width);
		height: var(--spacing-nav-height);
		background-color: var(--color-surface);
		border-top: 1px solid var(--color-border);
		padding-bottom: env(safe-area-inset-bottom, 0);
	}

	/* ナビ項目 */
	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.125rem;
		flex: 1;
		padding: 0.5rem 0;
		color: var(--color-text-muted);
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.nav-item:hover {
		color: var(--color-primary-400);
	}

	.nav-item.active {
		color: var(--color-primary-500);
	}

	/* ナビラベル */
	.nav-label {
		font-size: 0.625rem;
		font-weight: 500;
		line-height: 1;
	}
</style>
