import { derived, writable } from 'svelte/store';

function createRolesStore() {
	const { subscribe, set } = writable<string[]>([]);

	return {
		subscribe,
		set,
		reset: () => set([])
	};
}

export const rolesStore = createRolesStore();

export const loggedIn = derived(rolesStore, ($rolesStore) => {
	return $rolesStore.length > 0;
});

export const userCanWrite = derived(rolesStore, ($rolesStore) => {
	return $rolesStore.includes('admin');
});
