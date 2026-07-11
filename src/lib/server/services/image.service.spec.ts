import { beforeEach, describe, expect, it, vi } from 'vitest';

const publicEnv = vi.hoisted(() => ({ env: {} as Record<string, string | undefined> }));

vi.mock('$env/dynamic/public', () => publicEnv);
vi.mock('$env/dynamic/private', () => ({ env: {} }));

import { DEFAULT_MAX_UPLOAD_BYTES, getMaxUploadBytes, validateImageFile } from './image.service';

const makeFile = (bytes: number, type = 'image/jpeg'): File =>
	new File([new Uint8Array(bytes)], 'photo.jpg', { type });

describe('getMaxUploadBytes', () => {
	beforeEach(() => {
		publicEnv.env = {};
	});

	it('falls back to the default when unset', () => {
		expect(getMaxUploadBytes()).toBe(DEFAULT_MAX_UPLOAD_BYTES);
	});

	it('falls back to the default when the value is invalid', () => {
		publicEnv.env.PUBLIC_UPLOAD_MAX_BYTES = 'not-a-number';
		expect(getMaxUploadBytes()).toBe(DEFAULT_MAX_UPLOAD_BYTES);
	});

	it('falls back to the default when the value is not positive', () => {
		publicEnv.env.PUBLIC_UPLOAD_MAX_BYTES = '0';
		expect(getMaxUploadBytes()).toBe(DEFAULT_MAX_UPLOAD_BYTES);
	});

	it('uses the configured value when valid', () => {
		publicEnv.env.PUBLIC_UPLOAD_MAX_BYTES = '1024';
		expect(getMaxUploadBytes()).toBe(1024);
	});
});

describe('validateImageFile', () => {
	beforeEach(() => {
		publicEnv.env = { PUBLIC_UPLOAD_MAX_BYTES: '1024' };
	});

	it('accepts an allowed type within the size limit', () => {
		expect(() => validateImageFile(makeFile(512))).not.toThrow();
	});

	it('rejects a disallowed file type', () => {
		try {
			validateImageFile(makeFile(512, 'application/pdf'));
			expect.unreachable('should have thrown');
		} catch (e: unknown) {
			expect((e as { status: number }).status).toBe(400);
			expect((e as { body: { code: string } }).body.code).toBe('VALIDATION_ERROR');
		}
	});

	it('rejects a file that exceeds the configured size limit', () => {
		try {
			validateImageFile(makeFile(2048));
			expect.unreachable('should have thrown');
		} catch (e: unknown) {
			expect((e as { status: number }).status).toBe(400);
			expect((e as { body: { code: string } }).body.code).toBe('VALIDATION_ERROR');
			expect((e as { body: { message: string } }).body.message).toMatch(/too large/i);
		}
	});

	it('accepts a file exactly at the size limit', () => {
		expect(() => validateImageFile(makeFile(1024))).not.toThrow();
	});
});
