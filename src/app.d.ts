// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { ROLE } from '$lib/server/auth/permissions';
import type { ErrorCode } from '$lib/shared/error';

declare global {
	namespace App {
		interface Error {
			message: string;
			code: ErrorCode;
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
