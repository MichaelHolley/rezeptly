import { afterEach, describe, expect, it } from 'vitest';
import { PermissionsStore } from './roles.svelte';

describe('PermissionsStore', () => {
	afterEach(() => {
		PermissionsStore.resetRoles();
	});

	it.each([
		[[], false, false],
		[['user'], true, false],
		[['user', 'admin'], true, true]
	])('roles %j → isLoggedIn %s, canEdit %s', (roles, isLoggedIn, canEdit) => {
		PermissionsStore.roles = roles;
		expect(PermissionsStore.isLoggedIn).toBe(isLoggedIn);
		expect(PermissionsStore.canEdit).toBe(canEdit);
	});
});
