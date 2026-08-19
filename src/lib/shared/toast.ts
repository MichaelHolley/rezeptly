import { toast } from 'svelte-sonner';
import { toAppError } from './error';

export function reportError(error: unknown) {
	const { message, code } = toAppError(error);
	toast.error(code === 'UNHANDLED_ERROR' ? 'Something went wrong. Please try again.' : message);
	if (code === 'UNHANDLED_ERROR') console.error(error);
}
