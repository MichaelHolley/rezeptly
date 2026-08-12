import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './error';

describe('getErrorMessage', () => {
	it('should return the message from an http error body', () => {
		const error = {
			status: 409,
			body: { message: 'Tag already exists', code: 'VALIDATION_ERROR' }
		};
		expect(getErrorMessage(error, 'fallback')).toBe('Tag already exists');
	});

	it('should return the fallback for an error without a body', () => {
		expect(getErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
	});

	it('should return the fallback for an empty message', () => {
		expect(getErrorMessage({ body: { message: '' } }, 'fallback')).toBe('fallback');
	});

	it('should return the fallback for null and undefined', () => {
		expect(getErrorMessage(null, 'fallback')).toBe('fallback');
		expect(getErrorMessage(undefined, 'fallback')).toBe('fallback');
	});

	it('should return the fallback for a non-string message', () => {
		expect(getErrorMessage({ body: { message: 42 } }, 'fallback')).toBe('fallback');
	});
});
