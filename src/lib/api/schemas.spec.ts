import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import { ingredientIdSchema, recipeIdSchema, tagIdSchema } from './schemas';

const idSchemas = [
	['recipeIdSchema', recipeIdSchema],
	['ingredientIdSchema', ingredientIdSchema],
	['tagIdSchema', tagIdSchema]
] as const;

describe.each(idSchemas)('%s', (_name, schema) => {
	it.each([
		['a numeric string from FormData', '12', 12],
		['a number from a JSON payload', 12, 12]
	])('accepts %s', (_description, input, expected) => {
		expect(schema.parse(input)).toBe(expected);
	});

	it.each([
		['an empty string', ''],
		['a whitespace-only string', '   '],
		['a non-numeric string', 'abc'],
		['NaN', NaN],
		['a fractional value', '1.5'],
		['a negative value', '-1'],
		['zero', '0'],
		['a value above int4 max', '2147483648']
	])('rejects %s', (_description, input) => {
		expect(schema.safeParse(input).success).toBe(false);
	});
});

expectTypeOf(recipeIdSchema.parse(1)).not.toEqualTypeOf(ingredientIdSchema.parse(1));
expectTypeOf(ingredientIdSchema.parse(1)).not.toEqualTypeOf(tagIdSchema.parse(1));
expectTypeOf(tagIdSchema.parse(1)).not.toEqualTypeOf(recipeIdSchema.parse(1));
expectTypeOf(1).toExtend<z.input<typeof recipeIdSchema>>();
expectTypeOf('1').toExtend<z.input<typeof recipeIdSchema>>();
