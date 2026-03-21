import { error } from '@sveltejs/kit';

export function throwNewPermissionError() {
	return error(403, {
		message: 'You do not have permission to perform this action.',
		code: 'PERMISSION_DENIED'
	});
}
