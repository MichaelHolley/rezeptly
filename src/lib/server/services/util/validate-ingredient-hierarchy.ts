type IngredientHierarchyIds = {
	ungroupedIngredientIds: number[];
	sections: { sectionId: number; ingredientIds: number[] }[];
};

function sameIds(actual: number[], submitted: number[]): boolean {
	return (
		actual.length === submitted.length &&
		new Set(submitted).size === submitted.length &&
		actual.every((id) => submitted.includes(id))
	);
}

export function validateIngredientHierarchy(
	sectionIds: number[],
	ingredientIds: number[],
	hierarchy: IngredientHierarchyIds
): 'sections' | 'ingredients' | null {
	if (
		!sameIds(
			sectionIds,
			hierarchy.sections.map(({ sectionId }) => sectionId)
		)
	)
		return 'sections';
	const submittedIngredients = [
		...hierarchy.ungroupedIngredientIds,
		...hierarchy.sections.flatMap(({ ingredientIds }) => ingredientIds)
	];
	return sameIds(ingredientIds, submittedIngredients) ? null : 'ingredients';
}
