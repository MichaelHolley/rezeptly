import { describe, expect, it } from 'vitest';
import { PermissionsStore } from './roles.svelte';

describe('PermissionsStore', () => {
	it('derives permissions through role changes and reset', () => {
		PermissionsStore.resetRoles();
		expect(PermissionsStore).toMatchObject({ roles: [], isLoggedIn: false, canEdit: false });

		PermissionsStore.roles = ['user'];
		expect(PermissionsStore).toMatchObject({ isLoggedIn: true, canEdit: false });

		PermissionsStore.roles = ['admin'];
		expect(PermissionsStore).toMatchObject({ isLoggedIn: true, canEdit: true });

		PermissionsStore.resetRoles();
		expect(PermissionsStore).toMatchObject({ roles: [], isLoggedIn: false, canEdit: false });
	});
});
