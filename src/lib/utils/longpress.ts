/**
 * 簡易的なロングプレス（長押し）を検知するSvelte Action
 * @param node 対象となるHTML要素
 * @param duration 長押しと判定するまでの時間（ミリ秒、デフォルト: 500ms）
 */
export function longpress(node: HTMLElement, duration: number = 500) {
	let timer: ReturnType<typeof setTimeout>;

	// タッチやクリックが開始された時の処理
	const handleMousedown = () => {
		// 指定時間（duration）経過後に 'longpress' カスタムイベントを発火させる
		timer = setTimeout(() => {
			node.dispatchEvent(new CustomEvent('longpress'));
		}, duration);
	};

	// ユーザーが指を離したりクリックを解除した時の処理
	const handleMouseup = () => {
		// 長押し判定に達する前に解除された場合はタイマーをキャンセルする
		clearTimeout(timer);
	};

	// マウスイベントの登録
	node.addEventListener('mousedown', handleMousedown);
	node.addEventListener('mouseup', handleMouseup);
	// 要素外にポインターが外れた場合も長押しをキャンセル
	node.addEventListener('mouseleave', handleMouseup);

	// タッチイベントの登録 (passive: true を指定してスクロール性能の低下を防ぐ)
	node.addEventListener('touchstart', handleMousedown, { passive: true });
	node.addEventListener('touchend', handleMouseup);
	// タッチ操作がシステムによってキャンセルされた場合
	node.addEventListener('touchcancel', handleMouseup);

	return {
		// パラメータ（duration）が動的に変更された場合の処理
		update(newDuration: number) {
			duration = newDuration;
		},
		// コンポーネント破棄時にイベントリスナーとタイマーをクリーンアップする
		destroy() {
			node.removeEventListener('mousedown', handleMousedown);
			node.removeEventListener('mouseup', handleMouseup);
			node.removeEventListener('mouseleave', handleMouseup);
			node.removeEventListener('touchstart', handleMousedown);
			node.removeEventListener('touchend', handleMouseup);
			node.removeEventListener('touchcancel', handleMouseup);
			clearTimeout(timer);
		}
	};
}
