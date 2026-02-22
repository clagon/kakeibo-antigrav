export function focusTrap(node: HTMLElement) {
	const previousFocusedElement = document.activeElement as HTMLElement;

	const focusableElements =
		':is(button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])):not([disabled])';

	function handleKeydown(e: KeyboardEvent) {
		if (e.key !== 'Tab') return;

		const focusable = Array.from(node.querySelectorAll<HTMLElement>(focusableElements));
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];

		if (e.shiftKey) {
			if (document.activeElement === first) {
				last.focus();
				e.preventDefault();
			}
		} else {
			if (document.activeElement === last) {
				first.focus();
				e.preventDefault();
			}
		}
	}

	node.addEventListener('keydown', handleKeydown);

	// 初回マウント時に最初の要素へフォーカスを試みる
	setTimeout(() => {
		const focusable = Array.from(node.querySelectorAll<HTMLElement>(focusableElements));
		if (focusable.length > 0) focusable[0].focus();
	}, 10);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
			if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
				previousFocusedElement.focus();
			}
		}
	};
}
