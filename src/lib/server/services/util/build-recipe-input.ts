import { DURATION_BUCKETS } from '$lib/shared/duration';
import type { ExtractedRecipeData } from '../ai.service';
import type { NewIngredient, NewInstruction, Tag, TagInput } from '../../types';
import { generateSlug } from './generate-slug';

export type RecipeInput = {
	name: string;
	description: string | null;
	durationMinutes: number | null;
	portions: number | null;
	ingredients: Omit<NewIngredient, 'recipeId'>[];
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

/**
 * Resolves proposed tags against the existing vocabulary on slug + category, adopting the
 * stored name. Unmatched proposals are dropped — an import may never create a tag.
 */
function resolveTags(proposed: ExtractedRecipeData['tags'], existingTags: Tag[]): TagInput[] {
	const byKey = new Map(existingTags.map((tag) => [`${tag.category}::${tag.slug}`, tag]));

	return proposed.flatMap((proposal) => {
		const slug = generateSlug(proposal.name ?? '');
		if (!slug) return [];

		const match = byKey.get(`${proposal.category}::${slug}`);
		return match ? [{ name: match.name, category: match.category }] : [];
	});
}

export function buildRecipeInput(extracted: ExtractedRecipeData, existingTags: Tag[]): RecipeInput {
	return {
		name: extracted.name?.trim() ?? '',
		description: emptyToNull(extracted.description),
		durationMinutes: snapToDurationBucket(extracted.durationMinutes),
		portions: clampPortions(extracted.portions),
		ingredients: extracted.ingredients
			.map((ingredient) => ({ name: ingredient.name?.trim() ?? '' }))
			.filter((ingredient) => ingredient.name.length > 0),
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
