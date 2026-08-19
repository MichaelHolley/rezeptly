import { isHttpError } from '@sveltejs/kit';
import { toast } from 'svelte-sonner';

function isAppError(error: unknown): error is App.Error {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof error.message === 'string' &&
		'code' in error &&
		typeof error.code === 'string'
	);
}

export function toAppError(error: unknown): {
	message: string;
	code: App.Error['code'];
	status?: number;
} {
	if (isHttpError(error)) {
		return { status: error.status, message: error.body.message, code: error.body.code };
	}

	if (isAppError(error)) {
		return error;
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
