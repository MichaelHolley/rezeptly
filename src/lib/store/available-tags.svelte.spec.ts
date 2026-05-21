import { beforeEach, describe, expect, it } from 'vitest';
import { AvailableTagsStore } from './available-tags.svelte';

describe('AvailableTagsStore', () => {
	beforeEach(() => {
		AvailableTagsStore.tags = [];
	});

	it('should initialize with empty tags', () => {
		expect(AvailableTagsStore.tags).toEqual([]);
	});

	it('should store assigned tags', () => {
		const tags = [
			{ id: 1, name: 'Italian', category: 'cuisine' as const, recipeId: null },
			{ id: 2, name: 'Vegan', category: 'diet' as const, recipeId: null }
		];

		AvailableTagsStore.tags = tags;

		expect(AvailableTagsStore.tags).toEqual(tags);
	});

	it('should reflect updated tags after reassignment', () => {
		AvailableTagsStore.tags = [
			{ id: 1, name: 'Italian', category: 'cuisine' as const, recipeId: null }
		];
		AvailableTagsStore.tags = [];

		expect(AvailableTagsStore.tags).toEqual([]);
	});
});
