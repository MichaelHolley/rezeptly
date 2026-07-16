import { error } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toToolError } from './errors';

const GENERIC = 'An unexpected error occurred while handling the request.';

const caught = (fn: () => never): unknown => {
	try {
		fn();
	} catch (e) {
		return e;
	}
};

describe('toToolError', () => {
	beforeEach(() => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	it('keeps the message of a 4xx HttpError', () => {
		const result = toToolError(
			caught(() => error(404, { message: 'Recipe with slug foo not found', code: 'NOT_FOUND' }))
		);

		expect(result).toEqual({
			isError: true,
			content: [{ type: 'text', text: 'Recipe with slug foo not found' }]
		});
	});

	it('does not log an expected 4xx', () => {
		toToolError(caught(() => error(404, { message: 'nope', code: 'NOT_FOUND' })));

		expect(console.error).not.toHaveBeenCalled();
	});

	it('replaces a 5xx HttpError message with a generic one', () => {
		const result = toToolError(
			caught(() => error(500, { message: 'connection string leaked', code: 'UNHANDLED_ERROR' }))
		);

		expect(result.content[0].text).toBe(GENERIC);
		expect(console.error).toHaveBeenCalled();
	});

	it('replaces a non-HttpError throw with a generic message', () => {
		const result = toToolError(new Error('postgres://user:pw@host/db unreachable'));

		expect(result).toEqual({ isError: true, content: [{ type: 'text', text: GENERIC }] });
		expect(console.error).toHaveBeenCalled();
	});

	it('handles a thrown non-Error value', () => {
		const result = toToolError('boom');

		expect(result.content[0].text).toBe(GENERIC);
	});
});
