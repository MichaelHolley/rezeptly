// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { ROLE } from '$lib/server/auth/permissions';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			roles: ROLE[];
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
