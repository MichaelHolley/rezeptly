class Permissions {
	roles = $state<string[]>([]);

	isLoggedIn() {
		return this.roles.length > 0;
	}

	canEdit() {
		return this.roles.includes('admin');
	}

	resetRoles() {
		this.roles = [];
	}
}

export const PermissionsStore = new Permissions();
