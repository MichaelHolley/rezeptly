import { PersistedState } from 'runed';

export const rolesStore = new PersistedState<string[]>('roles', [], {
	syncTabs: true
});
