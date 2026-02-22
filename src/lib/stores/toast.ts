import { writable } from 'svelte/store';

/** トーストメッセージの型 */
export interface ToastMessage {
	id: number;
	text: string;
	type: 'success' | 'error';
}

/** トーストメッセージの store */
export const toasts = writable<ToastMessage[]>([]);

let nextId = 0;

/**
 * トースト通知を表示する
 * @param text 表示テキスト
 * @param type 種類（success / error）
 * @param duration 表示時間（ms）
 */
export function showToast(text: string, type: 'success' | 'error' = 'success', duration = 2500) {
	const id = nextId++;
	toasts.update((msgs) => [...msgs, { id, text, type }]);
	setTimeout(() => {
		toasts.update((msgs) => msgs.filter((m) => m.id !== id));
	}, duration);
}
