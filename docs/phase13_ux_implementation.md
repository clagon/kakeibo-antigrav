# UX Improvements Implementation Plan

This plan covers the implementation of the Quick Add feature, Visual Feedback (Animations), and Empty State enhancements.

## Proposed Changes

### 1. Proposal A: Quick Add (入力フローの高速化)

#### [MODIFY] `src/lib/components/QuickCategories.svelte`

- Change the shape of the quick category buttons from pill-shaped (`border-radius: 2rem;`) to rounded rectangles (`border-radius: 0.5rem;` to match the app's established design language like CategoryGrid and modal contents).
- Adjust padding and alignment to suit the new shape.

### 2. Proposal C: Visual Feedback (アニメーションの強化)

#### [NEW] `src/lib/globalState.svelte.ts` (or similar store)

- Create a global state to manage user preferences, specifically `enableAnimations` (default: true).

#### [MODIFY] `src/lib/components/AnimatedNumber.svelte`

- Support an opt-out mechanism based on the global state.
- If `enableAnimations` is false, update the number instantaneously (set the tween duration to 0, or bypass tweening entirely).

#### [MODIFY] Settings Page (e.g. `src/routes/settings/+page.svelte` if it exists)

- Add a toggle switch to control `enableAnimations`.

### 3. Proposal B: Swipe Actions (リスト操作の直感性向上)

#### [MODIFY] `src/lib/components/LineItemList.svelte`

- Refactor the list `<li>` items to use CSS Scroll Snap for a native swipe-to-reveal effect.
- Wrap the main item content into a `flex: 0 0 100%` container.
- Place the delete button in a separate `flex: 0 0 auto` container next to it.
- Hide visual scrollbars but allow horizontal scrolling.
- Remove the inline delete button and replace it with this swipeable hidden action.

### 4. Proposal D: Empty State (エンプティステートの改善)

#### [MODIFY] `src/routes/calendar/+page.svelte`

- Update the empty state UI (`receipts.length === 0`).
- Add a generic "Empty Wallet" or "Document" icon using `LucideIcon`.
- Add a clear CTA button "入力を始める" that navigates to `/` (optionally with the selected `date` param).

## Verification Plan

- **Quick Add**: Verify that clicking a quick category opens the drawer with the category pre-selected.
- **Animations**: Verify that adding/removing items smoothly updates the total and animates the list items.
- **Empty State**: Verify that the calendar empty state looks visually appealing and the CTA button correctly routes to the input page.
