import { error } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { toAppError } from './error';

describe('toAppError', () => {
	it('extracts status, message, and code from an HttpError', () => {
		try {
			error(409, { message: 'Tag already exists', code: 'VALIDATION_ERROR' });
		} catch (e) {
			expect(toAppError(e)).toEqual({
				status: 409,
				message: 'Tag already exists',
				code: 'VALIDATION_ERROR'
			});
		}
	});

	it('falls back to the Error message with an UNHANDLED_ERROR code', () => {
		expect(toAppError(new Error('network down'))).toEqual({
			code: 'UNHANDLED_ERROR',
			message: 'network down'
		});
	});

	it('falls back to a generic message for non-Error, non-HttpError values', () => {
		expect(toAppError('nope')).toEqual({
			code: 'UNHANDLED_ERROR',
			message: 'An unknown error occurred'
		});
	});
});
