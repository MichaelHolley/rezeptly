import { describe, expect, it } from 'vitest';
import { formIdSchema, idSchema } from './schemas';

describe('formIdSchema', () => {
	describe('valid input', () => {
		it('should accept a numeric string from FormData', () => {
			expect(formIdSchema.parse('12')).toBe(12);
		});

		it('should accept a number from a JSON payload', () => {
			expect(formIdSchema.parse(12)).toBe(12);
		});
	});

	describe('input that Number() would silently coerce', () => {
		it('should reject an empty string rather than yielding 0', () => {
			expect(formIdSchema.safeParse('').success).toBe(false);
		});

		it('should reject a whitespace-only string rather than yielding 0', () => {
			expect(formIdSchema.safeParse('   ').success).toBe(false);
		});

		it('should reject a non-numeric string rather than yielding NaN', () => {
			expect(formIdSchema.safeParse('abc').success).toBe(false);
		});
	});

	describe('input outside the int4 column range', () => {
		it('should reject a fractional value', () => {
			expect(formIdSchema.safeParse('1.5').success).toBe(false);
		});

		it('should reject a negative value', () => {
			expect(formIdSchema.safeParse('-1').success).toBe(false);
		});

		it('should reject zero', () => {
			expect(formIdSchema.safeParse('0').success).toBe(false);
		});

		it('should reject a value above int4 max', () => {
			expect(formIdSchema.safeParse('2147483648').success).toBe(false);
		});
	});
});

describe('idSchema', () => {
	it('should accept a positive integer', () => {
		expect(idSchema.parse(7)).toBe(7);
	});

	it('should reject a string, since JSON payloads send ids as numbers', () => {
		expect(idSchema.safeParse('7').success).toBe(false);
	});

	it('should reject a fractional value', () => {
		expect(idSchema.safeParse(1.5).success).toBe(false);
	});

	it('should reject NaN', () => {
		expect(idSchema.safeParse(NaN).success).toBe(false);
	});
});
