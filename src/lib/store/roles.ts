import { derived, writable } from 'svelte/store';

function createRolesStore() {
	const { subscribe, set } = writable<string[]>([]);

	return {
		subscribe,
		set,
		reset: () => set([]),
		userCanWrite: derived({ subscribe }, ($roles) => {
			return $roles.includes('admin');
		}),
		loggedIn: derived({ subscribe }, ($roles) => {
			return $roles.length > 0;
		})
	};
}

export const rolesStore = createRolesStore();
