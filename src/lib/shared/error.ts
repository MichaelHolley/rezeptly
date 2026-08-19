import { isHttpError } from '@sveltejs/kit';
import { toast } from 'svelte-sonner';

export function toAppError(error: unknown): {
	message: string;
	code: App.Error['code'];
	status?: number;
} {
	if (isHttpError(error)) {
		return { status: error.status, message: error.body.message, code: error.body.code };
	}

	return {
		code: 'UNHANDLED_ERROR',
		message: error instanceof Error ? error.message : 'An unknown error occurred'
	};
}

export function reportError(error: unknown) {
	const { message, code } = toAppError(error);
	toast.error(code === 'UNHANDLED_ERROR' ? 'Something went wrong. Please try again.' : message);
	if (code === 'UNHANDLED_ERROR') console.error(error);
}
