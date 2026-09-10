import type { RecipeCourse } from '$lib/shared/course';
import { DURATION_BUCKETS } from '$lib/shared/duration';
import type { ExtractedRecipeData } from '../ai.service';
import type { NewInstruction, Tag, TagInput } from '../../types';
import type { IngredientGroupNames } from '../ingredient.service';
import { resolveTags } from './resolve-tags';

export type RecipeInput = {
	name: string;
	description: string | null;
	course: RecipeCourse | null;
	durationMinutes: number | null;
	portions: number | null;
	ingredientGroups: IngredientGroupNames[];
	instructions: Omit<NewInstruction, 'recipeId'>[];
	tags: TagInput[];
};

const MIN_PORTIONS = 1;
const MAX_PORTIONS = 99;

function snapToDurationBucket(minutes: number | null): number | null {
	if (minutes == null || !Number.isFinite(minutes)) return null;

	return DURATION_BUCKETS.reduce((nearest, bucket) =>
		Math.abs(bucket - minutes) < Math.abs(nearest - minutes) ? bucket : nearest
	);
}

function clampPortions(portions: number | null): number | null {
	if (portions == null || !Number.isInteger(portions)) return null;
	if (portions < MIN_PORTIONS || portions > MAX_PORTIONS) return null;

	return portions;
}

function emptyToNull(value: string | null | undefined): string | null {
	return value?.trim() || null;
}

export function buildIngredientGroups(
	groups: ExtractedRecipeData['ingredients']
): IngredientGroupNames[] {
	const normalized = groups.map((group) => ({
		heading: emptyToNull(group.heading),
		items: group.items.map((name) => name.trim()).filter(Boolean)
	}));
	const named = normalized.filter(
		(group): group is { heading: string; items: string[] } => group.heading !== null
	);
	const ungrouped = normalized
		.filter(({ heading }) => heading === null)
		.flatMap(({ items }) => items);

	return named.length || ungrouped.length ? [{ heading: null, items: ungrouped }, ...named] : [];
}

export function buildRecipeInput(extracted: ExtractedRecipeData, existingTags: Tag[]): RecipeInput {
	return {
		name: extracted.name?.trim() ?? '',
		description: emptyToNull(extracted.description),
		course: extracted.course,
		durationMinutes: snapToDurationBucket(extracted.durationMinutes),
		portions: clampPortions(extracted.portions),
		ingredientGroups: buildIngredientGroups(extracted.ingredients),
		instructions: extracted.instructions
			.filter((section) => section.instructions?.trim())
			.map((section, index) => ({
				heading: emptyToNull(section.heading),
				instructions: section.instructions.trim(),
				stepOrder: index + 1
			})),
		tags: resolveTags(extracted.tags, existingTags)
	};
}
