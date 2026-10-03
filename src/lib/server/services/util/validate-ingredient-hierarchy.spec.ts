import { describe, expect, it } from 'vitest';
import { validateIngredientHierarchy } from './validate-ingredient-hierarchy';

const emptySections = (sectionIds: number[]) =>
	sectionIds.map((sectionId) => ({ sectionId, ingredientIds: [] }));

describe('validateIngredientHierarchy', () => {
	it.each([
		[
			'accepts a complete hierarchy',
			{
				ungroupedIngredientIds: [1],
				sections: [
					{ sectionId: 10, ingredientIds: [2, 3] },
					{ sectionId: 11, ingredientIds: [] }
				]
			},
			null
		],
		[
			'rejects missing section ids',
			{ ungroupedIngredientIds: [1, 2, 3], sections: emptySections([10]) },
			'sections'
		],
		[
			'rejects duplicate section ids',
			{ ungroupedIngredientIds: [1, 2, 3], sections: emptySections([10, 10]) },
			'sections'
		],
		[
			'rejects foreign section ids',
			{ ungroupedIngredientIds: [1, 2, 3], sections: emptySections([10, 12]) },
			'sections'
		],
		[
			'rejects missing ingredient ids',
			{ ungroupedIngredientIds: [1, 2], sections: emptySections([10, 11]) },
			'ingredients'
		],
		[
			'rejects duplicate ingredient ids',
			{ ungroupedIngredientIds: [1, 2, 2], sections: emptySections([10, 11]) },
			'ingredients'
		],
		[
			'rejects foreign ingredient ids',
			{ ungroupedIngredientIds: [1, 2, 4], sections: emptySections([10, 11]) },
			'ingredients'
		]
	])('%s', (_, hierarchy, expected) => {
		expect(validateIngredientHierarchy([10, 11], [1, 2, 3], hierarchy)).toBe(expected);
	});
});
