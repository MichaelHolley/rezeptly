import { describe, expect, it } from 'vitest';
import { throwNewPermissionError } from './error';

describe('throwNewPermissionError', () => {
	it('should throw with 403 status', () => {
		expect(() => throwNewPermissionError()).toThrow();

		try {
			throwNewPermissionError();
		} catch (e: unknown) {
			expect((e as { status: number }).status).toBe(403);
		}
	});

	it('should throw with PERMISSION_DENIED code', () => {
		try {
			throwNewPermissionError();
		} catch (e: unknown) {
			expect((e as { body: { code: string } }).body.code).toBe('PERMISSION_DENIED');
		}
	});

	it('should throw with descriptive message', () => {
		try {
			throwNewPermissionError();
		} catch (e: unknown) {
			expect((e as { body: { message: string } }).body.message).toBeTruthy();
		}
	});
});
