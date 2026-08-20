import { describe, expect, it } from 'vitest';
import { buildRecipeInput } from './build-recipe-input';
import type { ExtractedRecipeData } from '../ai.service';
import type { Tag } from '../../types';

const emptyExtraction = (): ExtractedRecipeData => ({
	isRecipe: true,
	name: '',
	description: '',
	course: null,
	durationMinutes: null,
	portions: null,
	tags: [],
	ingredients: [],
	instructions: []
});

const tag = (id: number, name: string, slug: string, category: Tag['category']): Tag => ({
	id,
	name,
	slug,
	category
});

describe('buildRecipeInput', () => {
	describe('name', () => {
		it('should trim the name', () => {
			const result = buildRecipeInput({ ...emptyExtraction(), name: '  Pasta  ' }, []);
			expect(result.name).toBe('Pasta');
		});

		it('should fall back to empty string when name is nullish', () => {
			const result = buildRecipeInput(
				{ ...emptyExtraction(), name: undefined as unknown as string },
				[]
			);
			expect(result.name).toBe('');
		});
	});

	describe('description', () => {
		it('should trim a non-empty description', () => {
			const result = buildRecipeInput({ ...emptyExtraction(), description: '  Tasty  ' }, []);
			expect(result.description).toBe('Tasty');
		});

		it('should map a blank description to null', () => {
			const result = buildRecipeInput({ ...emptyExtraction(), description: '   ' }, []);
			expect(result.description).toBeNull();
		});
	});

	describe('course', () => {
		it('should pass an extracted course through unchanged', () => {
			expect(buildRecipeInput({ ...emptyExtraction(), course: 'dessert' }, []).course).toBe(
				'dessert'
			);
		});

		it('should return null for null', () => {
			expect(buildRecipeInput({ ...emptyExtraction(), course: null }, []).course).toBeNull();
		});
	});

	describe('durationMinutes', () => {
		it('should snap to the nearest bucket', () => {
			expect(
				buildRecipeInput({ ...emptyExtraction(), durationMinutes: 7 }, []).durationMinutes
			).toBe(5);
			expect(
				buildRecipeInput({ ...emptyExtraction(), durationMinutes: 200 }, []).durationMinutes
			).toBe(180);
		});

		it('should snap exact bucket values to themselves', () => {
			expect(
				buildRecipeInput({ ...emptyExtraction(), durationMinutes: 45 }, []).durationMinutes
			).toBe(45);
		});

		it('should return null for null', () => {
			expect(
				buildRecipeInput({ ...emptyExtraction(), durationMinutes: null }, []).durationMinutes
			).toBeNull();
		});

		it('should return null for non-finite input', () => {
			expect(
				buildRecipeInput({ ...emptyExtraction(), durationMinutes: Infinity }, []).durationMinutes
			).toBeNull();
			expect(
				buildRecipeInput({ ...emptyExtraction(), durationMinutes: NaN }, []).durationMinutes
			).toBeNull();
		});
	});

	describe('portions', () => {
		it('should keep a valid portion count', () => {
			expect(buildRecipeInput({ ...emptyExtraction(), portions: 4 }, []).portions).toBe(4);
		});

		it('should reject values outside 1..99', () => {
			expect(buildRecipeInput({ ...emptyExtraction(), portions: 0 }, []).portions).toBeNull();
			expect(buildRecipeInput({ ...emptyExtraction(), portions: 100 }, []).portions).toBeNull();
		});

		it('should reject non-integer values', () => {
			expect(buildRecipeInput({ ...emptyExtraction(), portions: 1.5 }, []).portions).toBeNull();
		});

		it('should return null for null', () => {
			expect(buildRecipeInput({ ...emptyExtraction(), portions: null }, []).portions).toBeNull();
		});
	});

	describe('ingredients', () => {
		it('should trim names and drop blank ingredients', () => {
			const result = buildRecipeInput(
				{
					...emptyExtraction(),
					ingredients: [{ name: '  150g Mehl  ' }, { name: '   ' }, { name: 'Salz' }]
				},
				[]
			);
			expect(result.ingredients).toEqual([{ name: '150g Mehl' }, { name: 'Salz' }]);
		});
	});

	describe('instructions', () => {
		it('should drop sections with blank instructions and renumber stepOrder', () => {
			const result = buildRecipeInput(
				{
					...emptyExtraction(),
					instructions: [
						{ heading: 'Prep', instructions: '  Chop onions  ' },
						{ heading: 'Ignore', instructions: '   ' },
						{ heading: '  ', instructions: 'Cook' }
					]
				},
				[]
			);
			expect(result.instructions).toEqual([
				{ heading: 'Prep', instructions: 'Chop onions', stepOrder: 1 },
				{ heading: null, instructions: 'Cook', stepOrder: 2 }
			]);
		});
	});

	describe('tags', () => {
		const existing: Tag[] = [
			tag(1, 'Dinner', 'dinner', 'type'),
			tag(2, 'Italian', 'italian', 'cuisine')
		];

		it('should adopt the stored name for a matched proposal', () => {
			const result = buildRecipeInput(
				{ ...emptyExtraction(), tags: [{ name: 'dinner', category: 'type' }] },
				existing
			);
			expect(result.tags).toEqual([{ name: 'Dinner', category: 'type' }]);
		});

		it('should drop proposals with no matching slug + category', () => {
			const result = buildRecipeInput(
				{
					...emptyExtraction(),
					tags: [
						{ name: 'dinner', category: 'cuisine' },
						{ name: 'Unknown', category: 'type' }
					]
				},
				existing
			);
			expect(result.tags).toEqual([]);
		});

		it('should drop proposals whose name yields no slug', () => {
			const result = buildRecipeInput(
				{ ...emptyExtraction(), tags: [{ name: '!!!', category: 'type' }] },
				existing
			);
			expect(result.tags).toEqual([]);
		});
	});
});
