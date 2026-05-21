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
			{ id: 1, name: 'Italian', slug: 'italian', category: 'cuisine' as const },
			{ id: 2, name: 'Vegan', slug: 'vegan', category: 'diet' as const }
		];

		AvailableTagsStore.tags = tags;

		expect(AvailableTagsStore.tags).toEqual(tags);
	});

	it('should reflect updated tags after reassignment', () => {
		AvailableTagsStore.tags = [
			{ id: 1, name: 'Italian', slug: 'italian', category: 'cuisine' as const }
		];
		AvailableTagsStore.tags = [];

		expect(AvailableTagsStore.tags).toEqual([]);
	});
});
