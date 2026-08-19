import { isHttpError } from '@sveltejs/kit';

export const ERROR_CODES = [
	'NOT_FOUND',
	'VALIDATION_ERROR',
	'PERMISSION_DENIED',
	'CONFIGURATION_ERROR',
	'INVALID_CREDENTIALS',
	'RATE_LIMITED',
	'UNHANDLED_ERROR'
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type AppError = {
	message: string;
	code: ErrorCode;
	status?: number;
};

function isErrorCode(value: unknown): value is ErrorCode {
	return ERROR_CODES.includes(value as ErrorCode);
}

function isAppError(error: unknown): error is App.Error {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof error.message === 'string' &&
		'code' in error &&
		isErrorCode(error.code)
	);
}

export function toAppError(error: unknown): AppError {
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
