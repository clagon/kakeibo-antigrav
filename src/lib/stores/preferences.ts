// src/lib/stores/preferences.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Default preferences
const defaultPreferences = {
	enableAnimations: true,
	autoFocusMemo: false
};

// Initialize from localStorage if available
const initialPreferences = browser
	? JSON.parse(localStorage.getItem('kakeibo_prefs') || JSON.stringify(defaultPreferences))
	: defaultPreferences;

// Create writable store
export const userPreferences = writable<{ enableAnimations: boolean; autoFocusMemo: boolean }>(
	initialPreferences
);

// Subscribe to changes and save to localStorage
if (browser) {
	userPreferences.subscribe((prefs) => {
		localStorage.setItem('kakeibo_prefs', JSON.stringify(prefs));
	});
}
