import { describe, expect, it } from 'vitest';
import {
	assistantDetailsProposalSchema,
	assistantIngredientProposalSchema,
	assistantInstructionProposalSchema,
	detailsProposalIsStale,
	diffLists,
	listProposalIsStale,
	type AssistantDetailsState
} from './recipe-assistant';

const details: AssistantDetailsState = {
	name: 'Soup',
	description: null,
	course: 'main',
	durationMinutes: 30,
	portions: 4
};

describe('recipe assistant proposals', () => {
	it('only treats affected detail fields as stale', () => {
		expect(
			detailsProposalIsStale({ ...details, portions: 6 }, { name: { from: 'Soup', to: 'Stew' } })
		).toBe(false);
		expect(
			detailsProposalIsStale({ ...details, name: 'Salad' }, { name: { from: 'Soup', to: 'Stew' } })
		).toBe(true);
	});

	it('supports nullable optional details and rejects malformed changes', () => {
		expect(
			assistantDetailsProposalSchema.safeParse({ description: { from: null, to: 'Warm' } }).success
		).toBe(true);
		expect(assistantDetailsProposalSchema.safeParse({}).success).toBe(false);
		expect(
			assistantDetailsProposalSchema.safeParse({ name: { from: 'Soup', to: '' } }).success
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
