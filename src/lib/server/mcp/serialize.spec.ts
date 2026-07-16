import { describe, expect, it } from 'vitest';
import type { RecipeMetadata, RecipeWithDetails, Tag } from '../types';
import { serializeRecipeDetail, serializeRecipeSummary, serializeTag } from './serialize';

const tag: Tag = { id: 7, name: 'Italian', slug: 'italian', category: 'cuisine' };

const metadata: RecipeMetadata = {
	id: 1,
	name: 'Carbonara',
	slug: 'carbonara',
	description: 'Roman classic',
	imageUrl: null,
	durationMinutes: 25,
	portions: 2,
	createdAt: new Date('2026-01-15T10:30:00.000Z'),
	tags: [tag]
};

const detail: RecipeWithDetails = {
	...metadata,
	ingredients: [
		{ id: 3, name: 'Guanciale', recipeId: 1 },
		{ id: 4, name: 'Pecorino', recipeId: 1 }
	],
	instructions: [
		{ id: 20, heading: null, instructions: 'Serve immediately', stepOrder: 2, recipeId: 1 },
		{ id: 10, heading: 'Prep', instructions: 'Dice the guanciale', stepOrder: 1, recipeId: 1 }
	]
};

describe('serializeTag', () => {
	it('exposes only the public tag fields', () => {
		expect(serializeTag(tag)).toEqual({ name: 'Italian', slug: 'italian', category: 'cuisine' });
	});
});

describe('serializeRecipeSummary', () => {
	it('omits the internal id', () => {
		expect(serializeRecipeSummary(metadata)).not.toHaveProperty('id');
	});

	it('converts createdAt to an ISO string', () => {
		expect(serializeRecipeSummary(metadata).createdAt).toBe('2026-01-15T10:30:00.000Z');
	});

	it('maps a null createdAt to null rather than throwing', () => {
		expect(serializeRecipeSummary({ ...metadata, createdAt: null }).createdAt).toBeNull();
	});

	it('preserves nullable fields', () => {
		const result = serializeRecipeSummary({ ...metadata, description: null, portions: null });

		expect(result.description).toBeNull();
		expect(result.portions).toBeNull();
	});
});

describe('serializeRecipeDetail', () => {
	it('flattens ingredients to names', () => {
		expect(serializeRecipeDetail(detail).ingredients).toEqual(['Guanciale', 'Pecorino']);
	});

	it('sorts instructions by stepOrder', () => {
		expect(serializeRecipeDetail(detail).instructions.map((i) => i.stepOrder)).toEqual([1, 2]);
	});

	it('does not mutate the source instructions', () => {
		serializeRecipeDetail(detail);

		expect(detail.instructions[0].stepOrder).toBe(2);
	});

	it('omits internal ids from instructions', () => {
		expect(serializeRecipeDetail(detail).instructions[0]).toEqual({
			heading: 'Prep',
			instructions: 'Dice the guanciale',
			stepOrder: 1
		});
	});
});
