import { describe, expect, it } from 'vitest';
import {
	assistantDetailsProposalSchema,
	assistantIngredientProposalSchema,
	assistantInstructionProposalSchema,
	listProposalIsStale
} from './recipe-assistant';

describe('recipe assistant proposals', () => {
	it('accepts one or more detail values as a partial update', () => {
		expect(assistantDetailsProposalSchema.parse({ description: null })).toEqual({
			description: null
		});
		expect(assistantDetailsProposalSchema.safeParse({ name: 'Stew', portions: 6 }).success).toBe(
			true
		);
		expect(assistantDetailsProposalSchema.safeParse({}).success).toBe(false);
		expect(assistantDetailsProposalSchema.safeParse({ name: '' }).success).toBe(false);
		expect(assistantDetailsProposalSchema.safeParse({ name: null }).success).toBe(false);
	});

	it('holds detail values to the same limits as the edit form', () => {
		expect(assistantDetailsProposalSchema.safeParse({ durationMinutes: 45 }).success).toBe(true);
		expect(assistantDetailsProposalSchema.safeParse({ durationMinutes: 47 }).success).toBe(false);
		expect(assistantDetailsProposalSchema.safeParse({ portions: 100 }).success).toBe(false);
	});

	it('compares complete lists exactly', () => {
		expect(listProposalIsStale(['salt', 'water'], ['salt', 'water'])).toBe(false);
		expect(listProposalIsStale(['water', 'salt'], ['salt', 'water'])).toBe(true);
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
