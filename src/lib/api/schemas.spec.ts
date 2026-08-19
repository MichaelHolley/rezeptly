import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import { ingredientIdSchema, recipeIdSchema, tagIdSchema } from './schemas';

const idSchemas = [
	['recipeIdSchema', recipeIdSchema],
	['ingredientIdSchema', ingredientIdSchema],
	['tagIdSchema', tagIdSchema]
] as const;

describe.each(idSchemas)('%s', (_name, schema) => {
	describe('valid input', () => {
		it('should accept a numeric string from FormData', () => {
			expect(schema.parse('12')).toBe(12);
		});

		it('should accept a number from a JSON payload', () => {
			expect(schema.parse(12)).toBe(12);
		});
	});

	describe('input that Number() would silently coerce', () => {
		it('should reject an empty string rather than yielding 0', () => {
			expect(schema.safeParse('').success).toBe(false);
		});

		it('should reject a whitespace-only string rather than yielding 0', () => {
			expect(schema.safeParse('   ').success).toBe(false);
		});

		it('should reject a non-numeric string rather than yielding NaN', () => {
			expect(schema.safeParse('abc').success).toBe(false);
		});

		it('should reject NaN', () => {
			expect(schema.safeParse(NaN).success).toBe(false);
		});
	});

	describe('input outside the int4 column range', () => {
		it('should reject a fractional value', () => {
			expect(schema.safeParse('1.5').success).toBe(false);
		});

		it('should reject a negative value', () => {
			expect(schema.safeParse('-1').success).toBe(false);
		});

		it('should reject zero', () => {
			expect(schema.safeParse('0').success).toBe(false);
		});

		it('should reject a value above int4 max', () => {
			expect(schema.safeParse('2147483648').success).toBe(false);
		});
	});
});

/**
 * Brand checks are compile-time only, so they live outside `it()`: `pnpm check` enforces
 * them, while vitest would see a test that registers no assertion.
 */
expectTypeOf(recipeIdSchema.parse(1)).not.toEqualTypeOf(ingredientIdSchema.parse(1));
expectTypeOf(ingredientIdSchema.parse(1)).not.toEqualTypeOf(tagIdSchema.parse(1));
expectTypeOf(tagIdSchema.parse(1)).not.toEqualTypeOf(recipeIdSchema.parse(1));


expectTypeOf(1).toExtend<z.input<typeof recipeIdSchema>>();
expectTypeOf('1').toExtend<z.input<typeof recipeIdSchema>>();
