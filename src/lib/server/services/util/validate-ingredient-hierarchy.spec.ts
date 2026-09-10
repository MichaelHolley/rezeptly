import { describe, expect, it } from 'vitest';
import { validateIngredientHierarchy } from './validate-ingredient-hierarchy';

const valid = {
	ungroupedIngredientIds: [1],
	sections: [
		{ sectionId: 10, ingredientIds: [2, 3] },
		{ sectionId: 11, ingredientIds: [] }
	]
};

describe('validateIngredientHierarchy', () => {
	it('accepts a complete hierarchy', () => {
		expect(validateIngredientHierarchy([10, 11], [1, 2, 3], valid)).toBeNull();
	});

	it.each([
		['missing', [10]],
		['duplicate', [10, 10]],
		['foreign', [10, 12]]
	])('rejects %s section ids', (_, sectionIds) => {
		expect(
			validateIngredientHierarchy([10, 11], [1, 2, 3], {
				...valid,
				sections: sectionIds.map((sectionId) => ({ sectionId, ingredientIds: [] }))
			})
		).toBe('sections');
	});

	it.each([
		['missing', [1, 2]],
		['duplicate', [1, 2, 2]],
		['foreign', [1, 2, 4]]
	])('rejects %s ingredient ids', (_, submittedIds) => {
		expect(
			validateIngredientHierarchy([10, 11], [1, 2, 3], {
				ungroupedIngredientIds: submittedIds,
				sections: [
					{ sectionId: 10, ingredientIds: [] },
					{ sectionId: 11, ingredientIds: [] }
				]
			})
		).toBe('ingredients');
	});
});
