import { beforeEach, describe, expect, it } from 'vitest';
import { PermissionsStore } from './roles.svelte';

describe('PermissionsStore', () => {
	beforeEach(() => {
		PermissionsStore.resetRoles();
	});

	it('should initialize with empty roles', () => {
		expect(PermissionsStore.roles).toEqual([]);
	});

	describe('isLoggedIn', () => {
		it('should return false when no roles are assigned', () => {
			expect(PermissionsStore.isLoggedIn).toBe(false);
		});

		it('should return true when user has roles', () => {
			PermissionsStore.roles = ['user'];
			expect(PermissionsStore.isLoggedIn).toBe(true);
		});

		it('should return true when user has multiple roles', () => {
			PermissionsStore.roles = ['user', 'admin'];
			expect(PermissionsStore.isLoggedIn).toBe(true);
		});
	});

	describe('canEdit', () => {
		it('should return false when user has no roles', () => {
			expect(PermissionsStore.canEdit).toBe(false);
		});

		it('should return false when user does not have admin role', () => {
			PermissionsStore.roles = ['user'];
			expect(PermissionsStore.canEdit).toBe(false);
		});

		it('should return true when user has admin role', () => {
			PermissionsStore.roles = ['admin'];
			expect(PermissionsStore.canEdit).toBe(true);
		});

		it('should return true when user has admin among multiple roles', () => {
			PermissionsStore.roles = ['user', 'admin', 'moderator'];
			expect(PermissionsStore.canEdit).toBe(true);
		});
	});

	describe('resetRoles', () => {
		it('should clear all roles', () => {
			PermissionsStore.roles = ['user', 'admin'];
			PermissionsStore.resetRoles();
			expect(PermissionsStore.roles).toEqual([]);
		});

		it('should update isLoggedIn to false after reset', () => {
			PermissionsStore.roles = ['user'];
			expect(PermissionsStore.isLoggedIn).toBe(true);
			PermissionsStore.resetRoles();
			expect(PermissionsStore.isLoggedIn).toBe(false);
		});

		it('should update canEdit to false after reset', () => {
			PermissionsStore.roles = ['admin'];
			expect(PermissionsStore.canEdit).toBe(true);
			PermissionsStore.resetRoles();
			expect(PermissionsStore.canEdit).toBe(false);
		});
	});

	describe('reactivity', () => {
		it('should update derived values when roles change', () => {
			expect(PermissionsStore.isLoggedIn).toBe(false);
			expect(PermissionsStore.canEdit).toBe(false);

			PermissionsStore.roles = ['user'];
			expect(PermissionsStore.isLoggedIn).toBe(true);
			expect(PermissionsStore.canEdit).toBe(false);

			PermissionsStore.roles = ['admin'];
			expect(PermissionsStore.isLoggedIn).toBe(true);
			expect(PermissionsStore.canEdit).toBe(true);

			PermissionsStore.roles = [];
			expect(PermissionsStore.isLoggedIn).toBe(false);
			expect(PermissionsStore.canEdit).toBe(false);
		});
	});
});
