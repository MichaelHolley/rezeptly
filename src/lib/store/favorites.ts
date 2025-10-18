import { PersistedState } from 'runed';

export const favoritesStore = new PersistedState<number[]>('favorites', [], {
	syncTabs: true,
	storage: 'local'
});
