import { describe, expect, it } from 'vitest';
import {
	assistantDetailsProposalSchema,
	assistantIngredientProposalSchema,
	assistantInstructionProposalSchema,
	listProposalIsStale
} from './recipe-assistant';

describe('recipe assistant proposals', () => {
	it('accepts a single requested detail change', () => {
		expect(
			assistantDetailsProposalSchema.safeParse({
				changes: [{ field: 'description', value: 'A warmer description' }]
			}).success
		).toBe(true);
	});

	it('allows intentional clearing only for nullable details', () => {
		expect(
			assistantDetailsProposalSchema.safeParse({
				changes: [{ field: 'description', value: null }]
			}).success
		).toBe(true);
		expect(
			assistantDetailsProposalSchema.safeParse({
				changes: [{ field: 'name', value: null }]
			}).success
		).toBe(false);
	});

	it('requires at least one unique detail change', () => {
		expect(assistantDetailsProposalSchema.safeParse({ changes: [] }).success).toBe(false);
		expect(
			assistantDetailsProposalSchema.safeParse({
				changes: [
					{ field: 'name', value: 'Soup' },
					{ field: 'name', value: 'Stew' }
				]
			}).success
		).toBe(false);
	});

	it('rejects detail values outside the edit form constraints', () => {
		expect(
			assistantDetailsProposalSchema.safeParse({
				changes: [{ field: 'name', value: '' }]
			}).success
		).toBe(false);
		expect(
			assistantDetailsProposalSchema.safeParse({
				changes: [{ field: 'durationMinutes', value: 45 }]
			}).success
		).toBe(true);
		expect(
			assistantDetailsProposalSchema.safeParse({
				changes: [{ field: 'durationMinutes', value: 47 }]
			}).success
		).toBe(false);
		expect(
			assistantDetailsProposalSchema.safeParse({
				changes: [{ field: 'portions', value: 100 }]
			}).success
		).toBe(false);
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
