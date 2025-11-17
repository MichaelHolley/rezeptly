class Permissions {
	roles = $state<string[]>([]);

	canEdit = $derived(this.roles.includes('admin'));
	isLoggedIn = $derived(this.roles.length > 0);

	resetRoles() {
		this.roles = [];
	}
}

export const PermissionsStore = new Permissions();
