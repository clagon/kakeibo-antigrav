/**
 * 簡易的なロングプレス（長押し）を検知するSvelte Action
 * @param node 対象となるHTML要素
 * @param duration 長押しと判定するまでの時間（ミリ秒、デフォルト: 500ms）
 */
export function longpress(node: HTMLElement, duration: number = 500) {
	let timer: ReturnType<typeof setTimeout>;
	let isKeydownActive = false;

	// タッチ、クリック、またはキーボードが開始された時の処理
	const handleStart = () => {
		// 指定時間（duration）経過後に 'longpress' カスタムイベントを発火させる
		timer = setTimeout(() => {
			node.dispatchEvent(new CustomEvent('longpress'));
		}, duration);
	};

	// ユーザーが指を離したりクリック、キーボードを解除した時の処理
	const handleEnd = () => {
		// 長押し判定に達する前に解除された場合はタイマーをキャンセルする
		clearTimeout(timer);
		isKeydownActive = false;
	};

	// キーボード押下時の処理
	const handleKeydown = (e: KeyboardEvent) => {
		// Enter または Space キーの長押しをサポート
		if (e.key === 'Enter' || e.key === ' ') {
			// OSのリピート機能による連続発火を無視する
			if (e.repeat || isKeydownActive) return;

			isKeydownActive = true;
			handleStart();
		}
	};

	// マウスイベントの登録
	node.addEventListener('mousedown', handleStart);
	node.addEventListener('mouseup', handleEnd);
	// 要素外にポインターが外れた場合も長押しをキャンセル
	node.addEventListener('mouseleave', handleEnd);

	// タッチイベントの登録 (passive: true を指定してスクロール性能の低下を防ぐ)
	node.addEventListener('touchstart', handleStart, { passive: true });
	node.addEventListener('touchend', handleEnd);
	// タッチ操作がシステムによってキャンセルされた場合
	node.addEventListener('touchcancel', handleEnd);

	// キーボードイベントの登録
	node.addEventListener('keydown', handleKeydown);
	node.addEventListener('keyup', handleEnd);

	return {
		// パラメータ（duration）が動的に変更された場合の処理
		update(newDuration: number) {
			duration = newDuration;
		},
		// コンポーネント破棄時にイベントリスナーとタイマーをクリーンアップする
		destroy() {
			node.removeEventListener('mousedown', handleStart);
			node.removeEventListener('mouseup', handleEnd);
			node.removeEventListener('mouseleave', handleEnd);
			node.removeEventListener('touchstart', handleStart);
			node.removeEventListener('touchend', handleEnd);
			node.removeEventListener('touchcancel', handleEnd);
			node.removeEventListener('keydown', handleKeydown);
			node.removeEventListener('keyup', handleEnd);
			clearTimeout(timer);
		}
	};
}
