import { describe, expect, it } from 'vitest';
import {
	assistantDetailsProposalSchema,
	assistantIngredientProposalSchema,
	assistantInstructionProposalSchema,
	diffLists,
	listProposalIsStale
} from './recipe-assistant';

describe('recipe assistant proposals', () => {
	it('accepts one or more detail values as a delta', () => {
		expect(
			assistantDetailsProposalSchema.safeParse({
				changes: [{ field: 'description', value: null }]
			}).success
		).toBe(true);
		expect(
			assistantDetailsProposalSchema.safeParse({
				changes: [
					{ field: 'name', value: 'Stew' },
					{ field: 'portions', value: 6 }
				]
			}).success
		).toBe(true);
		expect(assistantDetailsProposalSchema.safeParse({ changes: [] }).success).toBe(false);
		expect(
			assistantDetailsProposalSchema.safeParse({
				changes: [{ field: 'name', value: '' }]
			}).success
		).toBe(false);
		expect(
			assistantDetailsProposalSchema.safeParse({
				changes: [
					{ field: 'name', value: 'Soup' },
					{ field: 'name', value: 'Stew' }
				]
			}).success
		).toBe(false);
	});

	it('compares complete lists exactly', () => {
		expect(listProposalIsStale(['salt', 'water'], ['salt', 'water'])).toBe(false);
		expect(listProposalIsStale(['water', 'salt'], ['salt', 'water'])).toBe(true);
	});

	it('distinguishes unchanged, removed, and added list entries', () => {
		expect(diffLists(['salt', 'water'], ['salt', 'pepper', 'water'])).toEqual([
			{ value: 'salt', kind: 'unchanged' },
			{ value: 'pepper', kind: 'added' },
			{ value: 'water', kind: 'unchanged' }
		]);
		expect(diffLists(['salt'], ['pepper'])).toEqual([
			{ value: 'salt', kind: 'removed' },
			{ value: 'pepper', kind: 'added' }
		]);
	});

	it('allows empty replacements but validates every supplied item', () => {
		expect(
			assistantIngredientProposalSchema.safeParse({ expected: ['salt'], replacement: [] }).success
		).toBe(true);
		expect(
			assistantIngredientProposalSchema.safeParse({ expected: [], replacement: [''] }).success
		).toBe(false);
		expect(
			assistantInstructionProposalSchema.safeParse({ expected: [], replacement: [] }).success
		).toBe(true);
		expect(
			assistantInstructionProposalSchema.safeParse({
				expected: [],
				replacement: [{ heading: null, instructions: '' }]
			}).success
		).toBe(false);
	});
});
