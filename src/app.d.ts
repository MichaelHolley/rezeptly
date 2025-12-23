// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { ROLE } from '$lib/server/auth/permissions';

declare global {
	namespace App {
		interface Error {
			message: string;
			code:
				| 'NOT_FOUND'
				| 'VALIDATION_ERROR'
				| 'PERMISSION_DENIED'
				| 'CONFIGURATION_ERROR'
				| 'UNHANDLED_ERROR';
			details?: unknown;
		}
		interface Locals {
			roles: ROLE[];
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
