import { browser } from '$app/environment';
import { writable } from 'svelte/store';

function createFavorites() {
	// Initialize to empty when SSR
	const initial = browser ? JSON.parse(localStorage.getItem('favorites') || '[]') : [];

	const store = writable(initial);

	if (browser) {
		store.subscribe((value) => {
			localStorage.setItem('favorites', JSON.stringify(value));
		});
	}

	return store;
}

export const favoritesStore = createFavorites();
